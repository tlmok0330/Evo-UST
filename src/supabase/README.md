# Supabase Database Setup for Cathay Pacific Travel Planner

## Overview
This project uses Supabase as the backend database to store flight information. The flights are fetched from the database and displayed in the Holiday tab.

## Database Schema

### Flights Table
The `flights` table stores all available flights with eco-friendly metrics:

**Columns:**
- `id` (UUID) - Primary key
- `flight_number` (TEXT) - Flight number (e.g., "CX 500")
- `airline` (TEXT) - Airline name
- `departure_code` (TEXT) - Departure airport code (e.g., "HKG")
- `departure_city` (TEXT) - Departure city name
- `departure_country` (TEXT) - Departure country
- `arrival_code` (TEXT) - Arrival airport code (e.g., "NRT")
- `arrival_city` (TEXT) - Arrival city name
- `arrival_country` (TEXT) - Arrival country
- `departure_time` (TEXT) - Departure time (e.g., "10:30")
- `arrival_time` (TEXT) - Arrival time (e.g., "15:45")
- `duration` (TEXT) - Flight duration (e.g., "4h 15m")
- `carbon_saved` (INTEGER) - Carbon savings in kg
- `green_points` (INTEGER) - Green points earned for booking
- `base_price` (INTEGER) - Base price in HKD
- `is_eco_friendly` (BOOLEAN) - Whether flight uses sustainable aviation fuel
- `created_at` (TIMESTAMP) - Record creation timestamp

## Setup Instructions

### 1. Connect to Supabase
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Update the credentials in `/lib/supabase.ts` with your project URL and anon key

### 2. Run Migration
Run the migration file to create the flights table and populate it with dummy data:

```bash
# Using Supabase CLI
supabase migration up
```

Or manually run the SQL from `/supabase/migrations/20251115000000_create_flights_table.sql` in your Supabase SQL Editor.

### 3. Verify Data
After running the migration, you should have:
- **40+ dummy flights** across 8 popular destinations:
  - Tokyo (NRT) - 5 flights
  - Singapore (SIN) - 4 flights
  - London (LHR) - 3 flights
  - Sydney (SYD) - 3 flights
  - San Francisco (SFO) - 3 flights
  - Bangkok (BKK) - 3 flights
  - Seoul (ICN) - 3 flights

## How It Works

### Frontend Integration
The `TravelPlanner` component (`/components/TravelPlanner.tsx`) automatically:
1. Fetches flights from Supabase when user searches for a destination
2. Filters by arrival airport code
3. Sorts by eco-friendly flights first, then by carbon savings
4. Falls back to generated mock data if database is unavailable

### Example Query
```typescript
const { data, error } = await supabase
  .from('flights')
  .select('*')
  .eq('arrival_code', 'NRT') // Tokyo flights
  .order('is_eco_friendly', { ascending: false })
  .order('carbon_saved', { ascending: false });
```

## Data Features

### Eco-Friendly Flights
- Marked with `is_eco_friendly: true`
- Use sustainable aviation fuel (SAF)
- Earn more green points (75-175 GP)
- Higher carbon savings (125-305 kg)
- Displayed with green badges in UI

### Standard Flights
- Lower green points (50-140 GP)
- Lower carbon savings (85-265 kg)
- Still contribute to sustainability goals

## For Presentation

During your presentation, you can:

1. **Show Real Database Integration**
   - Open Supabase dashboard to show the flights table
   - Demonstrate that data is fetched from a real database

2. **Search Multiple Destinations**
   - Search for Tokyo → Shows 5 flights from database
   - Search for Singapore → Shows 4 flights from database
   - Search for London → Shows 3 long-haul flights

3. **Highlight Features**
   - Flights are sorted by sustainability (eco-friendly first)
   - Real pricing and carbon savings data
   - Mix of eco-friendly and standard options

4. **Fallback System**
   - If database is unavailable, app gracefully falls back to generated data
   - Ensures app always works for demo

## Adding More Flights

To add more flights, insert into the `flights` table:

```sql
INSERT INTO flights (
  flight_number, airline,
  departure_code, departure_city, departure_country,
  arrival_code, arrival_city, arrival_country,
  departure_time, arrival_time, duration,
  carbon_saved, green_points, base_price, is_eco_friendly
) VALUES (
  'CX 999', 'Cathay Pacific',
  'HKG', 'Hong Kong', 'Hong Kong',
  'LAX', 'Los Angeles', 'United States',
  '22:00', '18:30', '12h 30m',
  320, 190, 9500, TRUE
);
```

## Security

- Row Level Security (RLS) is enabled
- Public read access is allowed for all users
- Only authenticated users can insert new flights (for future admin panel)
