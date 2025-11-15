-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  departure_code TEXT NOT NULL,
  departure_city TEXT NOT NULL,
  departure_country TEXT NOT NULL,
  arrival_code TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  arrival_country TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  carbon_saved INTEGER NOT NULL,
  green_points INTEGER NOT NULL,
  base_price INTEGER NOT NULL,
  is_eco_friendly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_flights_departure_arrival ON flights(departure_code, arrival_code);
CREATE INDEX idx_flights_eco_friendly ON flights(is_eco_friendly);

-- Insert dummy flight data for Tokyo (NRT)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 500', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'NRT', 'Tokyo', 'Japan', '10:30', '15:45', '4h 15m', 145, 85, 4200, TRUE),
('CX 502', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'NRT', 'Tokyo', 'Japan', '14:20', '19:50', '4h 30m', 128, 75, 3950, TRUE),
('CX 504', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'NRT', 'Tokyo', 'Japan', '08:15', '13:30', '4h 15m', 112, 65, 4100, FALSE),
('CX 506', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'NRT', 'Tokyo', 'Japan', '17:45', '23:10', '4h 25m', 98, 55, 3850, FALSE),
('CX 508', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'NRT', 'Tokyo', 'Japan', '19:30', '00:55', '4h 25m', 85, 50, 3750, FALSE);

-- Insert dummy flight data for Singapore (SIN)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 715', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SIN', 'Singapore', 'Singapore', '09:15', '13:05', '3h 50m', 165, 95, 3800, TRUE),
('CX 717', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SIN', 'Singapore', 'Singapore', '15:30', '19:20', '3h 50m', 155, 90, 3600, TRUE),
('CX 719', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SIN', 'Singapore', 'Singapore', '07:45', '11:35', '3h 50m', 140, 80, 3900, FALSE),
('CX 721', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SIN', 'Singapore', 'Singapore', '18:00', '21:50', '3h 50m', 125, 70, 3500, FALSE);

-- Insert dummy flight data for London (LHR)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 251', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'LHR', 'London', 'United Kingdom', '23:05', '05:20', '13h 15m', 285, 165, 8500, TRUE),
('CX 253', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'LHR', 'London', 'United Kingdom', '01:10', '07:25', '13h 15m', 265, 155, 8200, TRUE),
('CX 255', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'LHR', 'London', 'United Kingdom', '22:30', '04:45', '13h 15m', 245, 140, 8800, FALSE);

-- Insert dummy flight data for Sydney (SYD)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 111', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SYD', 'Sydney', 'Australia', '21:35', '09:30', '9h 55m', 220, 125, 6500, TRUE),
('CX 113', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SYD', 'Sydney', 'Australia', '09:40', '21:35', '9h 55m', 210, 120, 6300, TRUE),
('CX 115', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SYD', 'Sydney', 'Australia', '14:25', '02:20', '9h 55m', 195, 110, 6700, FALSE);

-- Insert dummy flight data for San Francisco (SFO)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 870', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SFO', 'San Francisco', 'United States', '23:50', '20:25', '11h 35m', 305, 175, 7800, TRUE),
('CX 872', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SFO', 'San Francisco', 'United States', '16:00', '12:35', '11h 35m', 285, 165, 7500, TRUE),
('CX 874', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'SFO', 'San Francisco', 'United States', '01:15', '21:50', '11h 35m', 265, 150, 8100, FALSE);

-- Insert dummy flight data for Bangkok (BKK)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 651', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'BKK', 'Bangkok', 'Thailand', '08:30', '10:35', '2h 5m', 135, 75, 2800, TRUE),
('CX 653', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'BKK', 'Bangkok', 'Thailand', '13:45', '15:50', '2h 5m', 125, 70, 2600, TRUE),
('CX 655', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'BKK', 'Bangkok', 'Thailand', '16:20', '18:25', '2h 5m', 110, 60, 2900, FALSE);

-- Insert dummy flight data for Seoul (ICN)
INSERT INTO flights (flight_number, airline, departure_code, departure_city, departure_country, arrival_code, arrival_city, arrival_country, departure_time, arrival_time, duration, carbon_saved, green_points, base_price, is_eco_friendly) VALUES
('CX 410', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'ICN', 'Seoul', 'South Korea', '10:05', '14:45', '3h 40m', 155, 90, 3500, TRUE),
('CX 412', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'ICN', 'Seoul', 'South Korea', '15:50', '20:30', '3h 40m', 145, 85, 3300, TRUE),
('CX 414', 'Cathay Pacific', 'HKG', 'Hong Kong', 'Hong Kong', 'ICN', 'Seoul', 'South Korea', '07:20', '12:00', '3h 40m', 130, 75, 3600, FALSE);

-- Enable Row Level Security
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON flights
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated insert (for future admin functionality)
CREATE POLICY "Allow authenticated insert" ON flights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
