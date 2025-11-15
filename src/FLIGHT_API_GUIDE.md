# Flight Search API Integration Guide

## 🎯 Overview

The flight search system is built with a clean **abstraction layer** that makes it easy to swap between a realistic simulation and real flight APIs. Currently, the app uses a **simulation mode** that generates realistic flight data with intelligent pricing and CO₂ calculations.

---

## 🏗️ Architecture

```
Frontend (React)
    ↓
/services/flightService.ts (API Client)
    ↓
Backend API Endpoint (/supabase/functions/server/index.tsx)
    ↓
/supabase/functions/server/flightService.ts (Provider Factory)
    ↓
    ├── SimulationFlightProvider (Current - Default)
    └── AmadeusFlightProvider (Real API - Ready to use)
```

### **Key Files:**

1. **`/types/flight.ts`** - TypeScript interfaces matching real API response structures
2. **`/supabase/functions/server/flightService.ts`** - Provider abstraction & factory
3. **`/supabase/functions/server/flightSimulation.ts`** - Realistic simulation algorithm
4. **`/services/flightService.ts`** - Frontend API client
5. **`/components/FlightBooking.tsx`** - Main UI component

---

## 🔄 How to Switch to Real API (3 Steps)

### **Step 1: Get API Credentials**

#### Option A: Amadeus API (Recommended - FREE tier available)
1. Go to: https://developers.amadeus.com/
2. Sign up for a free account
3. Create a new app
4. Copy your **API Key** and **API Secret**
5. Free tier includes: **2,000 API calls/month**

#### Option B: Other APIs
- **Skyscanner API**: https://rapidapi.com/skyscanner/api/skyscanner-flight-search
- **Aviationstack**: https://aviationstack.com/
- **Duffel API**: https://duffel.com/

### **Step 2: Add Environment Variables to Supabase**

1. Go to your Supabase Dashboard
2. Navigate to: **Settings → Edge Functions → Environment Variables**
3. Add these secrets:
   ```
   AMADEUS_API_KEY=your_api_key_here
   AMADEUS_API_SECRET=your_api_secret_here
   ```

### **Step 3: Enable Real API Mode**

Open `/supabase/functions/server/flightService.ts` and change line 16:

```typescript
// BEFORE (Simulation Mode)
const USE_REAL_API = false;

// AFTER (Real API Mode)
const USE_REAL_API = true;
```

**That's it!** ✅ Your app now uses real flight data.

---

## 🧪 Testing Both Modes

### **Simulation Mode Features:**
- ✅ Realistic pricing based on distance, cabin class, advance booking
- ✅ Accurate CO₂ calculations based on aircraft type
- ✅ Multiple flight options with time variations
- ✅ Green Points calculation based on efficiency
- ✅ No API costs or rate limits
- ✅ Works offline

### **Real API Mode Features:**
- ✅ Live Cathay Pacific flight availability
- ✅ Real-time pricing from airlines
- ✅ Actual flight schedules and routes
- ✅ Official CO₂ emission data
- ✅ Seat availability and booking classes

---

## 🔌 Adding a Different API Provider

Want to use Skyscanner instead of Amadeus? Here's how:

### **1. Create a New Provider Class**

Add to `/supabase/functions/server/flightService.ts`:

```typescript
class SkyscannerFlightProvider implements FlightProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = Deno.env.get('SKYSCANNER_API_KEY') || '';
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
    // 1. Call Skyscanner API
    const response = await fetch('https://skyscanner-api-endpoint.com/search', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: request.origin,
        destination: request.destination,
        // ... map request fields to Skyscanner format
      }),
    });

    if (!response.ok) {
      throw new Error(`Skyscanner API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 2. Transform Skyscanner response to our FlightSearchResponse format
    return {
      data: data.itineraries.map((itinerary: any) => ({
        id: itinerary.id,
        source: 'SKYSCANNER',
        // ... map all fields to match FlightOffer interface
        itineraries: [/* transform itinerary data */],
        price: {
          currency: itinerary.price.currency,
          total: itinerary.price.amount.toString(),
          // ...
        },
        co2Emissions: {
          weight: itinerary.carbonEmissions,
          // ...
        },
        // Calculate green points
        greenPoints: this.calculateGreenPoints(itinerary),
      })),
      meta: {
        count: data.itineraries.length,
        searchId: data.search_id,
      },
    };
  }

  private calculateGreenPoints(itinerary: any): number {
    // Your logic to calculate green points
    return Math.round(itinerary.distance / itinerary.carbonEmissions * 10);
  }
}
```

### **2. Update the Factory Function**

```typescript
export function getFlightProvider(): FlightProvider {
  if (USE_REAL_API) {
    const provider = Deno.env.get('FLIGHT_PROVIDER') || 'amadeus';
    
    switch (provider) {
      case 'skyscanner':
        return new SkyscannerFlightProvider();
      case 'amadeus':
        return new AmadeusFlightProvider();
      default:
        return new AmadeusFlightProvider();
    }
  } else {
    return new SimulationFlightProvider();
  }
}
```

### **3. Add Environment Variables**

```
FLIGHT_PROVIDER=skyscanner
SKYSCANNER_API_KEY=your_key_here
```

---

## 📊 Data Flow Example

### **User searches for flights:**
```
HKG → LAX
Departure: 2024-12-25
Return: 2025-01-05
Passengers: 2 Adults, 1 Child
Cabin: Business
```

### **Frontend Request:**
```typescript
{
  origin: "HKG",
  destination: "LAX",
  departureDate: "2024-12-25",
  returnDate: "2025-01-05",
  adults: 2,
  children: 1,
  infants: 0,
  cabinClass: "business"
}
```

### **API Response (standardized format):**
```typescript
{
  data: [
    {
      id: "CX880-20241225",
      source: "SIMULATION", // or "AMADEUS"
      price: {
        currency: "USD",
        grandTotal: 12450,
        base: "11500",
        fees: "950"
      },
      itineraries: [
        {
          segments: [{
            departure: { iataCode: "HKG", at: "2024-12-25T10:30:00" },
            arrival: { iataCode: "LAX", at: "2024-12-25T08:45:00" },
            carrierCode: "CX",
            flightNumber: "880",
            aircraft: { code: "77W", name: "Boeing 777-300ER" },
            duration: "PT13H15M"
          }],
          duration: "PT13H15M"
        }
      ],
      co2Emissions: {
        weight: 2840,
        perPassenger: 947,
        cabin: "business"
      },
      greenPoints: 450,
      ecoScore: 72
    }
  ],
  meta: {
    count: 5,
    searchId: "SEARCH-1234567890"
  }
}
```

---

## 🎨 UI Components

### **FlightSearch Component** (`/components/FlightSearch.tsx`)
- Airport selection (23 major airports pre-loaded)
- Date pickers with validation
- Cabin class selector
- Passenger counter
- Trip type toggle (one-way/round-trip)

### **FlightResults Component** (`/components/FlightResults.tsx`)
- Flight cards with route visualization
- CO₂ emissions display
- Green Points badges
- Eco Score indicators
- Amenities icons (WiFi, meals, power, entertainment)

### **FlightBooking Component** (`/components/FlightBooking.tsx`)
- Main orchestrator
- Loading states
- Success confirmation
- Green Points awarding
- Navigation to itinerary

---

## 🧮 Simulation Algorithm Details

The simulation generates realistic data using:

### **Pricing Calculation:**
```typescript
basePrice = distance × $0.12/km × cabinClassMultiplier × advanceBookingMultiplier
```

**Cabin Class Multipliers:**
- Economy: 1.0×
- Premium Economy: 1.8×
- Business: 4.5×
- First: 8.0×

**Advance Booking Multipliers:**
- < 7 days: 1.5× (last minute premium)
- 7-14 days: 1.3×
- 14-30 days: 1.1×
- 30-90 days: 1.0×
- > 90 days: 0.85× (early bird discount)

**Distance Discounts:**
- > 8000km: 15% discount per km
- 5000-8000km: 8% discount
- 3000-5000km: 5% discount

### **CO₂ Calculation:**
```typescript
co2 = distance × aircraftCO2Rate × cabinFactor
```

**Aircraft CO₂ Rates (kg/km):**
- A321neo: 2.2 kg/km (most efficient)
- A350-900: 2.8 kg/km
- A350-1000: 2.9 kg/km
- A330-300: 3.0 kg/km
- 777-300: 3.4 kg/km
- 777-300ER: 3.5 kg/km

**Cabin Factors:**
- Economy: 1.0× (most efficient use of space)
- Premium Economy: 1.4×
- Business: 2.2×
- First: 3.5×

### **Green Points Calculation:**
```typescript
efficiency = distance / co2  // km per kg CO₂
points = efficiency × 15
if (cabin === 'economy') points × 1.5  // Bonus for economy
points = max(50, points)  // Minimum 50 points
```

---

## 🔍 Debugging

### **Check which mode is active:**
Look for this log in Supabase Edge Function logs:
```
Using simulation for flight search
// or
Using Amadeus API for flight search
```

### **Test API Connection:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-db8b1db2/flights/search \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "HKG",
    "destination": "LAX",
    "departureDate": "2024-12-25",
    "adults": 1,
    "cabinClass": "economy"
  }'
```

### **Common Issues:**

**"Airport not found" error:**
- The airport code doesn't exist in the simulation database
- Add it to `/supabase/functions/server/flightSimulation.ts` AIRPORTS object

**"No flights found" with real API:**
- Check API credentials are correct
- Verify you're using Cathay Pacific filter: `includedAirlineCodes: 'CX'`
- Cathay Pacific might not fly that route

**Empty response from API:**
- Check Supabase logs for detailed error messages
- Verify environment variables are set correctly
- Check API quotas haven't been exceeded

---

## 📈 Future Enhancements

### **Easy additions:**
1. **Multi-city trips** - Already supported in data structure
2. **Stop-over options** - Add segment arrays in itineraries
3. **Flexible dates** - Search ±3 days for better prices
4. **Price alerts** - Store searches and check periodically
5. **Historical price trends** - Store price data in Supabase
6. **Alternative airports** - Suggest nearby airports (JFK/EWR/LGA)

### **Data structure supports:**
- Layovers and connections
- Mixed cabin classes
- Codeshare flights
- Seat maps
- Baggage policies
- Fare rules

---

## ✅ Checklist for Production

- [ ] Add error boundaries for API failures
- [ ] Implement request caching (reduce API costs)
- [ ] Add loading skeletons for better UX
- [ ] Set up API monitoring and alerts
- [ ] Add retry logic with exponential backoff
- [ ] Implement rate limiting on your side
- [ ] Add analytics tracking for searches
- [ ] Create fallback to simulation if API fails
- [ ] Add A/B testing for simulation vs real API
- [ ] Implement search result sorting/filtering

---

## 💡 Tips

1. **Start with simulation** - Perfect for development and testing
2. **Use test API keys** - Most providers have sandbox environments
3. **Monitor API costs** - Set up billing alerts
4. **Cache responses** - Same search within 15 mins = cached result
5. **Graceful degradation** - Fall back to simulation if API fails

---

## 📚 Resources

- **Amadeus API Docs**: https://developers.amadeus.com/self-service
- **Amadeus Test Data**: https://developers.amadeus.com/self-service/apis-docs/test-data
- **IATA Airport Codes**: https://www.iata.org/en/publications/directories/code-search/
- **Carbon Emission Standards**: https://www.icao.int/environmental-protection/Pages/ClimateChange_EmissionsCalculator.aspx

---

## 🆘 Support

If you encounter issues:

1. Check Supabase Edge Function logs
2. Verify environment variables are set
3. Test with curl/Postman first
4. Check API provider status page
5. Review rate limits and quotas

---

**Built with ❤️ for sustainable travel** 🌱✈️
