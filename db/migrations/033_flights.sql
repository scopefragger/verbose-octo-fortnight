CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flight_code VARCHAR(10) NOT NULL,
  airline_name TEXT,
  from_airport VARCHAR(10),
  to_airport VARCHAR(10),
  departure_scheduled TIMESTAMPTZ NOT NULL,
  arrival_scheduled TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notified_12h BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_flights_family_status ON flights(family_id, status);
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_active ON flights(departure_scheduled) WHERE status = 'active';
