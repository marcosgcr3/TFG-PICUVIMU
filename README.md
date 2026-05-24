# PICUVIMU - Visualización de Redes Genealógicas con Grafos e IA

PICUVIMU es una herramienta web desarrollada para la catalogación, consulta y análisis visual de redes de parentesco históricas y genealógicas. El proyecto permite estructurar relaciones familiares, representarlas interactivamente mediante grafos de nodos y consultarlas de forma sencilla mediante un chatbot inteligente.

El sistema utiliza **FastAPI** en el backend, **React (Vite)** junto a **ReactFlow** en el frontend para el renderizado del grafo, y **Supabase** (PostgreSQL) para la persistencia de datos. Además, integra la API de **Groq** para la interfaz del chat con el LLM.

---

## Cómo ponerlo en marcha rápidamente

Para facilitar el desarrollo y la ejecución en un solo clic, se incluyen scripts que levantan tanto el Frontend como el Backend de forma simultánea:

### En Windows (PowerShell / Batch)
Haz doble clic en el archivo:
```bash
start.bat
```
*O ejecuta el script `./start.ps1` desde una consola de PowerShell.*

### En Linux / macOS
Da permisos de ejecución al script e inícialo con:
```bash
chmod +x start.sh
./start.sh
```

---

## Configuración manual paso a paso

Si prefieres levantar cada parte por separado de forma individual, sigue estos pasos:

### 1. Backend (FastAPI)
1. Entra en la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea e inicia tu entorno virtual:
   - **Windows:** 
     ```bash
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
3. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configura tus variables de entorno creando un archivo `.env` en la raíz de `backend/`:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_api_key_anonima_de_supabase
   GROQ_API_KEY=tu_api_key_de_groq
   ```
5. Inicia el servidor de desarrollo local:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend (React + Vite)
1. Entra en la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configura el `.env` en la raíz de `frontend/` (opcional, por defecto apunta al puerto local del backend):
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Lanza el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```

---

## Configurar Supabase

Para que el proyecto funcione de forma correcta, necesitas realizar estas configuraciones sencillas en tu panel de Supabase:

### 1. Esquema de Base de Datos
Ejecuta el archivo [supabase_schema.sql](file:///c:/Users/marco/TFG/backend/supabase_schema.sql) en el **SQL Editor** de tu proyecto Supabase para crear las tablas necesarias.

### 2. Bucket para Imágenes de Personas
1. Crea un bucket público llamado `imagenes` en la sección **Storage** del panel.
2. Añade políticas RLS en el SQL Editor para permitir lectura y subida libre en ese bucket:
   ```sql
   CREATE POLICY "Acceso Publico" ON storage.objects FOR SELECT USING ( bucket_id = 'imagenes' );
   CREATE POLICY "Permitir Subidas" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'imagenes' );
   ```

---

## Características del proyecto

*   **Gestión de Fichas de Personas (CRUD)**: Edición completa con soporte para añadir atributos temporales o biográficos (nacimientos, bautizos, defunciones, cargos, etc.).
*   **Motor de parentesco**: Cálculo automático de relaciones recíprocas o inversas en base al género para más de 190 tipos de parentesco diferentes (definidos en `kinship_data.py`).
*   **Visualización en Grafo**: Renderizado interactivo utilizando **ReactFlow** y estructurado de forma jerárquica con el algoritmo **Dagre** para que el árbol familiar sea legible.
*   **Asistente Virtual (Chatbot)**: Interfaz de chat integrada que utiliza **Groq** para responder preguntas en lenguaje natural sobre las personas de la base de datos (por ejemplo: *¿Qué relación tiene Leonor con Ramón?*).
*   **Almacenamiento Local de Respaldo**: Las imágenes subidas se guardan también localmente para servir como fallback si falla el Storage en la nube.


