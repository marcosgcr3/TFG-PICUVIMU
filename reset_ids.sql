-- Script para re-indexar personas con IDs personalizados por género
-- Mujeres: M-001, M-002, ...
-- Hombres: V-001, V-002, ...

-- 1. Asegurarse de que la columna existe (si no, añadirla)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'IdPersonalizado') THEN
        ALTER TABLE personas ADD COLUMN "IdPersonalizado" TEXT;
    END IF;
END $$;

-- 2. Generar IDs para Mujeres
WITH Mujeres AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM personas
    WHERE "Genero" IN ('F', 'Femenino', 'femenino', 'mujer', 'Mujer')
)
UPDATE personas p
SET "IdPersonalizado" = 'M-' || LPAD(m.rn::text, 3, '0')
FROM Mujeres m
WHERE p.id = m.id;

-- 3. Generar IDs para Hombres
WITH Hombres AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM personas
    WHERE "Genero" IN ('M', 'Masculino', 'masculino', 'hombre', 'Hombre')
)
UPDATE personas p
SET "IdPersonalizado" = 'V-' || LPAD(h.rn::text, 3, '0')
FROM Hombres h
WHERE p.id = h.id;

-- 4. Generar IDs para otros/desconocidos (opcional, p.ej. X-001)
WITH Otros AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
    FROM personas
    WHERE "Genero" NOT IN ('F', 'Femenino', 'femenino', 'mujer', 'Mujer', 'M', 'Masculino', 'masculino', 'hombre', 'Hombre')
       OR "Genero" IS NULL
)
UPDATE personas p
SET "IdPersonalizado" = 'X-' || LPAD(o.rn::text, 3, '0')
FROM Otros o
WHERE p.id = o.id;

-- Ver resultados
SELECT id, "Nombre", "Apellidos", "Genero", "IdPersonalizado" FROM personas ORDER BY "IdPersonalizado";
