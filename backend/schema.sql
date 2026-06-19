-- ReFood — migrations seguras (podem ser re-executadas)
-- Execute no Railway: railway run psql $DATABASE_URL -f schema.sql

-- Colunas novas em tabelas existentes
ALTER TABLE alimentos ADD COLUMN IF NOT EXISTS usuario_id TEXT REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE usuarios  ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Histórico de consumo / descarte (US-11, US-12, US-13)
CREATE TABLE IF NOT EXISTS registros (
  id                  SERIAL PRIMARY KEY,
  usuario_id          TEXT        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  alimento_id         INTEGER,
  alimento_nome       TEXT        NOT NULL,
  alimento_categoria  TEXT        NOT NULL DEFAULT 'Outros',
  tipo                TEXT        NOT NULL CHECK (tipo IN ('consumido', 'descartado')),
  preco_estimado      NUMERIC(10,2) DEFAULT 0,
  criado_em           TIMESTAMPTZ DEFAULT NOW()
);

-- Lista de compras (US-09, US-10)
CREATE TABLE IF NOT EXISTS lista_compras (
  id          SERIAL PRIMARY KEY,
  usuario_id  TEXT    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome        TEXT    NOT NULL,
  quantidade  TEXT,
  unidade     TEXT,
  comprado    BOOLEAN DEFAULT FALSE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alimentos_usuario  ON alimentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registros_usuario  ON registros(usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_lista_usuario      ON lista_compras(usuario_id);
