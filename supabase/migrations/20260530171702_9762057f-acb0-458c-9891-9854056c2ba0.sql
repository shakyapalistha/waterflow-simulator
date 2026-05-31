-- Remove permissive anon policies; the page will now go through server routes
DROP POLICY IF EXISTS "Anyone can insert readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Anyone can view readings" ON public.sensor_readings;

-- Revoke direct Data API access from anon/authenticated; service_role still bypasses RLS
REVOKE ALL ON public.sensor_readings FROM anon;
REVOKE ALL ON public.sensor_readings FROM authenticated;
GRANT ALL ON public.sensor_readings TO service_role;

-- Keep RLS enabled; with no policies, anon/authenticated requests are blocked.
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Helpful index for the "latest 50" listing
CREATE INDEX IF NOT EXISTS idx_sensor_readings_reading_time
  ON public.sensor_readings (reading_time DESC);