
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reading_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'simulated',
  total_flow NUMERIC NOT NULL,
  eflow NUMERIC NOT NULL,
  ratio NUMERIC NOT NULL,
  temp NUMERIC,
  do_mgl NUMERIC,
  sediment_pct NUMERIC,
  ps4_status TEXT,
  ps6_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sensor_readings_time ON public.sensor_readings(reading_time DESC);

GRANT SELECT, INSERT ON public.sensor_readings TO anon, authenticated;
GRANT ALL ON public.sensor_readings TO service_role;

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view readings"
  ON public.sensor_readings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert readings"
  ON public.sensor_readings FOR INSERT
  WITH CHECK (true);
