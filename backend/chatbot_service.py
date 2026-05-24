import os
from typing import Dict, List, Any, Optional
from groq import Groq


class ChatbotService:
    def __init__(self, supabase_client: Any, model_name: str = "llama-3.1-8b-instant"):
        # Constructor para iniciar la conexión a Supabase y al API de Groq
        self.db = supabase_client
        self.model_name = model_name
        self.schema = self._get_database_schema()
        self.table_columns = {
            "Persona": ["id", "Nombre", "Apellidos", "Genero", "created_at"],
            "RelacionPersona": ["id", "persona_id", "persona_relacionada_id", "tipo_relacion", "categoria", "created_at"],
            "AtributoPersona": ["id", "persona_id", "nombre_atributo", "valor", "fecha_inicio", "fecha_fin", "notas", "source", "created_at"]
        }
        self.apellido_column = "Apellidos"
        
        # Cargamos el cliente de Groq con la api key del .env
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            print("Atención:  Ojo: GROQ_API_KEY no está configurada en las variables de entorno.")
        self.client = Groq(api_key=api_key)

    def _get_database_schema(self) -> str:
        # Retorna el esquema básico estructurado para que el chatbot conozca las tablas
        return """
        Tabla: Persona
          - id (int8)
          - Nombre (text)
          - Apellidos (text)
          - Genero (text, 'M' o 'F')
        
        Tabla: RelacionPersona
          - id (int8)
          - persona_id (int8, FK a Persona.id)
          - persona_relacionada_id (int8, FK a Persona.id)
          - tipo_relacion (text)
          - categoria (text, e.g. 'familiar')
        
        Tabla: AtributoPersona
          - id (int8)
          - persona_id (int8, FK a Persona.id)
          - nombre_atributo (text)
          - valor (text)
          - fecha_inicio (text, DD-MM-YYYY)
          - fecha_fin (text, DD-MM-YYYY)
          - notas (text)
        
        Relación: Una Persona tiene muchos AtributoPersona. Al buscar personas, siempre mira sus atributos para dar detalles biográficos.
        """



    def _extract_filters(self, query: str) -> Dict[str, str]:
        # Parsea el SQL generado para extraer filtros y pasarlos a Supabase
        import re
        filters = {}
        
        # Búsqueda por concatenación de nombre y apellidos
        full_name_pattern = r'(?:\"?Nombre\"?)\s*\|\|\s*\' \'\s*\|\|\s*(?:\"?Apellidos\"?)\s+ILIKE\s+\'%([^%]+)%\''
        full_name_match = re.search(full_name_pattern, query, re.IGNORECASE)
        if full_name_match:
            full_name = full_name_match.group(1).strip()
            parts = full_name.split(' ')
            if len(parts) >= 2:
                filters['Nombre'] = parts[0]
                filters['Apellidos'] = " ".join(parts[1:])
            else:
                filters['Nombre'] = full_name
            return filters

        # Filtros ILIKE normales individuales
        matches = re.finditer(r'(?:[\w\.]+\.)?\"?(\w+)\"?\s+ILIKE\s+\'%([^%]+)%\'', query, re.IGNORECASE)
        for m in matches:
            col = m.group(1).lower()
            val = m.group(2).strip()
            if 'nombre' in col:
                filters['Nombre'] = val
            elif 'apellido' in col:
                filters['Apellidos'] = val
        
        # Filtro de Género
        genero_match = re.search(r"Genero\s*=\s*'([^']+)'", query, re.IGNORECASE)
        if genero_match:
            filters['Genero'] = genero_match.group(1)
            
        return filters

    def _execute_query(self, query: str) -> Dict[str, Any]:
        # Ejecuta la consulta usando llamadas optimizadas de Supabase-py
        query_upper = query.upper()
        # Normalizamos un poco el formato para evitar fallos tontos de comillas
        query_clean = query_upper.replace('"', '').replace('  ', ' ')
        
        try:
            # 1. Consultas tipo COUNT para estadísticas
            if "COUNT" in query_clean:
                if "PERSONA" in query_clean and "RELACIONPERSONA" not in query_clean:
                    res = self.db.table("Persona").select("id", count="exact").execute()
                    return {"data": [{"total": res.count}], "total_count": res.count}
                elif "RELACIONPERSONA" in query_clean:
                    res = self.db.table("RelacionPersona").select("id", count="exact").execute()
                    return {"data": [{"total": res.count}], "total_count": res.count}

            # 2. Consultas tipo DISTINCT (ej. ver tipos de relación disponibles)
            if "DISTINCT" in query_clean:
                if "TIPO_RELACION" in query_clean:
                    data = self.db.table("RelacionPersona").select("tipo_relacion").execute().data
                    unique_types = list(set(item['tipo_relacion'] for item in data if item.get('tipo_relacion')))
                    return {"data": [{"tipo_relacion": t} for t in unique_types], "total_count": len(unique_types)}

            # 3. Consultas de Personas (búsqueda flexible por texto)
            if "FROM PERSONA" in query_clean or "JOIN" in query_clean:
                filters = self._extract_filters(query)
                q = self.db.table("Persona").select("*, AtributoPersona(*)", count="exact")
                
                # Truco con y sin tildes por si hay inconsistencias en la codificación de la base de datos
                if filters.get('Nombre'):
                    name = filters['Nombre']
                    name_alt = name.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')
                    if name != name_alt:
                        q = q.or_(f"Nombre.ilike.%{name}%,Nombre.ilike.%{name_alt}%")
                    else:
                        q = q.ilike("Nombre", f"%{name}%")
                        
                if filters.get('Apellidos'):
                    surname = filters['Apellidos']
                    surname_alt = surname.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')
                    if surname != surname_alt:
                        q = q.or_(f"Apellidos.ilike.%{surname}%,Apellidos.ilike.%{surname_alt}%")
                    else:
                        q = q.ilike("Apellidos", f"%{surname}%")
                        
                if filters.get('Genero'):
                    q = q.eq("Genero", filters['Genero'])
                        
                res = q.limit(50).execute()
                data = res.data
                
                # Si es una persona concreta, traemos sus parentescos formateados a texto natural
                if len(data) == 1:
                    person_id = data[0]['id']
                    main_name = f"{data[0]['Nombre']} {data[0]['Apellidos']}"
                    
                    rel_res = self.db.table("RelacionPersona").select("*, persona:persona_id(Nombre, Apellidos), relacionada:persona_relacionada_id(Nombre, Apellidos)").or_(f"persona_id.eq.{person_id},persona_relacionada_id.eq.{person_id}").execute()
                    
                    # Lo pasamos a lenguaje natural para que el LLM redacte mejor
                    human_rels = []
                    seen_relatives = set()
                    for r in rel_res.data:
                        p1_name = f"{r['persona']['Nombre']} {r['persona']['Apellidos']}"
                        p2_name = f"{r['relacionada']['Nombre']} {r['relacionada']['Apellidos']}"
                        rel_type = r['tipo_relacion']
                        
                        rel_id = r['persona_relacionada_id'] if r['persona_id'] == person_id else r['persona_id']
                        
                        if rel_id not in seen_relatives:
                            if r['persona_id'] == person_id:
                                human_rels.append(f"{main_name} es {rel_type} de {p2_name}")
                            else:
                                human_rels.append(f"{p1_name} es {rel_type} de {main_name}")
                            seen_relatives.add(rel_id)
                    
                    data[0]['Relaciones_Humanas'] = human_rels

                return {"data": data, "total_count": res.count}

            # Si no hay filtros y es una consulta general, devolvemos las primeras 20 personas
            if "WHERE" not in query_clean and ("PERSONA" in query_clean or "SELECT *" in query_clean):
                res = self.db.table("Persona").select("Nombre, Apellidos, Genero", count="exact").limit(20).execute()
                return {"data": res.data, "total_count": res.count}
            
            # En cualquier otro caso devolvemos vacío para evitar alucinaciones
            return {"data": [], "total_count": 0}
        except Exception as e:
            raise Exception(f"Error al procesar la query: {str(e)}")
    
    def _generate_sql_query(self, user_question: str, history: List[Dict[str, str]] = []) -> str:
        # Usa Groq para generar el SQL a partir de la pregunta e histórico
        persona_cols = ", ".join(self.table_columns.get("Persona", []))
        relacion_cols = ", ".join(self.table_columns.get("RelacionPersona", []))
        atributos_cols = ", ".join(self.table_columns.get("AtributoPersona", []))

        # Cargamos el histórico para que recuerde el contexto de la conversación
        history_str = ""
        if history:
            history_str = "\nHISTORIAL DE CONVERSACIÓN:\n"
            for msg in history[-5:]: # Últimos 5 mensajes
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                history_str += f"{role}: {msg['content']}\n"

        prompt = f"""Eres un experto en SQL para la base de datos genealógica PICUVIMU, alojada en PostgreSQL (Supabase).
{history_str}
ESQUEMA DE LA BASE DE DATOS:
{self.schema}

    DISPOSICION REAL (usa estos nombres exactos de tabla y columna):
    - Tabla Persona: {persona_cols}
    - Tabla RelacionPersona: {relacion_cols}
    - Tabla AtributoPersona: {atributos_cols}

REGLAS IMPORTANTES:
1. Solo genera consultas SELECT (lectura). NUNCA INSERT, UPDATE, DELETE, DROP, etc.
2. La consulta debe ser válida para PostgreSQL.
3. IMPORTANTE: Los nombres de columnas son con mayúsculas/minúsculas exactas: Nombre, {self.apellido_column}
4. Usa ILIKE para búsquedas parciales (case-insensitive en PostgreSQL/Supabase).
5. Para buscar personas por nombre y apellidos: WHERE "Nombre" ILIKE '%nombre%' AND "Apellidos" ILIKE '%apellidos%'
6. La tabla RelacionPersona usa: persona_id, persona_relacionada_id, tipo_relacion, categoria.
7. Para contar personas: SELECT COUNT(*) as total FROM "Persona"
8. Para relaciones: JOIN "RelacionPersona" ON "Persona".id = "RelacionPersona".persona_id
9. Si preguntan "¿Qué tipos de relación hay?": SELECT DISTINCT tipo_relacion FROM "RelacionPersona"
10. Si el usuario confirma una sugerencia anterior (ej: "Sí", "Esa es"), genera la consulta basada en el contexto del historial.
11. Devuelve SOLO la consulta SQL, sin explicaciones, sin markdown, sin ```sql
12. RAZONAMIENTO PASO A PASO: Antes de generar el SQL, identifica mentalmente las tablas necesarias y las claves de unión (JOINs).

EJEMPLOS:
Pregunta: "¿Cuántas personas hay?"
SQL: SELECT COUNT(*) as total FROM "Persona"

Pregunta: "¿Quién es Leonor de Borbón?"
SQL: SELECT * FROM "Persona" WHERE "Nombre" ILIKE '%Leonor%' AND "Apellidos" ILIKE '%Borbón%'

PREGUNTA DEL USUARIO: {user_question}

SQL:"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model_name,
                temperature=0.1,  # Temperatura baja para SQL determinista
                max_tokens=150
            )
            
            sql_query = chat_completion.choices[0].message.content.strip()
            
            # Limpiamos marcadores de código por si el LLM los mete
            sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
            
            if '\n' in sql_query:
                sql_query = sql_query.split('\n')[0].strip()

            sql_query = self._normalize_sql_query(sql_query)
            return sql_query
        except Exception as e:
            raise Exception(f"Fallo al generar SQL: {str(e)}")

    def _normalize_sql_query(self, sql_query: str) -> str:
        # Corrige pequeños typos de columnas comunes del modelo para compatibilidad
        normalized = sql_query

        if self.apellido_column == 'Apellidos':
            normalized = normalized.replace('Primer_apellido', 'Apellidos')
        elif self.apellido_column == 'Primer_apellido':
            normalized = normalized.replace('Apellidos', 'Primer_apellido')

        normalized = normalized.replace('persona_relacionado_id', 'persona_relacionada_id')
        return normalized
    
    def _format_response(self, user_question: str, sql_query: str, results_dict: Dict[str, Any], history: List[Dict[str, str]] = []) -> str:
        # Redacta una respuesta amigable basada en los registros obtenidos de Supabase
        results = results_dict.get("data", [])
        total_count = results_dict.get("total_count", len(results))

        if not results and total_count == 0:
            return "No he encontrado información que coincida con esa consulta en la base de datos."

        import json
        limited_results = results[:30]
        results_str = json.dumps(limited_results, ensure_ascii=False)

        history_str = ""
        if history:
            history_str = "\nCONTEXTO PREVIO:\n"
            for msg in history[-3:]:
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                history_str += f"{role}: {msg['content']}\n"

        prompt = f"""Responde a la siguiente pregunta sobre la base de datos genealógica PICUVIMU.
{history_str}
Pregunta del usuario: "{user_question}"
Resultados encontrados: {total_count}
Datos de la base de datos: {results_str}

REGLAS DE RESPUESTA (SÍGUELAS ESTRICTAMENTE):
1. TU ÚNICA FUNCIÓN es responder sobre la base de datos genealógica PICUVIMU.
2. SI LA PREGUNTA NO ESTÁ RELACIONADA con la genealogía, las personas de la base de datos o el sistema PICUVIMU, DEBES RECHAZARLA AMABLEMENTE. Di algo como: "Lo siento, solo puedo responder preguntas relacionadas con la base de datos genealógica de PICUVIMU."
3. NO respondas a preguntas de matemáticas, cultura general, consejos, o cualquier otro tema ajeno.
4. NO incluyas frases robóticas como "Total de registros" o "Resultados encontrados" al inicio.
5. NO incluyas resúmenes técnicos ni menciones la base de datos, el JSON o el SQL.
6. Responde de forma DIRECTA, natural y humana sobre los datos genealógicos.
7. Si hay datos en "Relaciones_Humanas", úsalas para describir los parentescos.
8. Si hay datos en "AtributoPersona", úsalos para la biografía.
9. IMPORTANTE: Usa SIEMPRE tildes y caracteres españoles correctamente.
10. Si el usuario pregunta por una persona específica y la encuentras, empieza hablando directamente de ella.
"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Eres el asistente inteligente de PICUVIMU, especializado EXCLUSIVAMENTE en genealogía y en la base de datos del sistema. No respondes preguntas fuera de este ámbito."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model_name,
                temperature=0.3,
                max_tokens=400
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error redactando respuesta: {e}")
            return "Encontré los datos pero tuve un problema al redactar la respuesta. Por favor, inténtalo de nuevo."
    
    def process_query(self, user_question: str, history: List[Dict[str, str]] = []) -> Dict[str, Any]:
        # Método principal que orquesta la generación del SQL, su ejecución y el formateo
        try:
            sql_query = self._generate_sql_query(user_question, history)
            
            if not sql_query.strip().upper().startswith('SELECT'):
                return {
                    "success": False,
                    "error": "Solo SELECT permitido",
                    "response": "Por seguridad, solo puedo realizar consultas de lectura."
                }
            
            results_dict = self._execute_query(sql_query)
            response = self._format_response(user_question, sql_query, results_dict, history)
            
            return {
                "success": True,
                "response": response,
                "sql_query": sql_query,
                "results_count": results_dict.get("total_count", 0),
                "raw_results": results_dict.get("data", [])[:5]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": f"Error:  Lo siento, ocurrió un error al procesar tu consulta: {str(e)}"
            }


# Instancia única del servicio (Singleton) para optimizar recursos
_chatbot_instance = None

def get_chatbot_service(supabase_client: Any, model_name: str = "llama-3.1-8b-instant") -> ChatbotService:
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = ChatbotService(supabase_client, model_name)
    return _chatbot_instance

