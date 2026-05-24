-- ==========================================
-- SQL para crear las tablas en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ==========================================

-- Tabla principal de personas
CREATE TABLE IF NOT EXISTS "Persona" (
    id SERIAL PRIMARY KEY,
    "Nombre" TEXT NOT NULL,
    "Apellidos" TEXT NOT NULL,
    "Genero" TEXT
);

-- Tabla de relaciones entre personas
CREATE TABLE IF NOT EXISTS "RelacionPersona" (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES "Persona"(id) ON DELETE CASCADE,
    persona_relacionada_id INTEGER NOT NULL REFERENCES "Persona"(id) ON DELETE CASCADE,
    tipo_relacion TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'familiar'
);

-- Tabla de imágenes de personas
CREATE TABLE IF NOT EXISTS "ImagenPersona" (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES "Persona"(id) ON DELETE CASCADE,
    nombre_imagen TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fuente TEXT
);

-- Tabla de atributos temporales
CREATE TABLE IF NOT EXISTS "AtributoPersona" (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER NOT NULL REFERENCES "Persona"(id) ON DELETE CASCADE,
    nombre_atributo TEXT NOT NULL,
    valor TEXT NOT NULL,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    notas TEXT,
    source TEXT,
    created_at TEXT DEFAULT now()::text,
    updated_at TEXT DEFAULT now()::text
);

-- ==========================================
-- Políticas RLS (Row Level Security)
-- Permiten acceso público de lectura/escritura con anon key
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE "Persona" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RelacionPersona" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ImagenPersona" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AtributoPersona" ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso total para anon (todos los usuarios de la app)
CREATE POLICY "allow_all_persona" ON "Persona" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_relacion" ON "RelacionPersona" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_imagen" ON "ImagenPersona" FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_atributo" ON "AtributoPersona" FOR ALL TO anon USING (true) WITH CHECK (true);
