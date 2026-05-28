CREATE TABLE IF NOT EXISTS alimentos (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(100)   NOT NULL,
  categoria     VARCHAR(50)    NOT NULL,
  quantidade    NUMERIC(10,2)  NOT NULL CHECK (quantidade > 0),
  unidade       VARCHAR(20)    NOT NULL,
  data_validade DATE           NOT NULL,
  criado_em     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_alimento
BEFORE UPDATE ON alimentos
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();