import { useState } from 'react';
import { Plane, CalendarIcon, Leaf, ChevronDown, Award, TrendingDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CabinPassengerSelector } from './CabinPassengerSelector';
import { TripTypeSelector } from './TripTypeSelector';
import { AirportSelector } from './AirportSelector';
import { DiscountCodeDialog } from './DiscountCodeDialog';
import { ItineraryPlannerDialog } from './ItineraryPlannerDialog';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  carbonSaved: number;
  greenPoints: number;
  price: number;
  isEcoFriendly: boolean;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  isPinned: boolean;
  isEcoFriendly?: boolean;
  partnerName?: string;
  description?: string;
}

export interface DayPlan {
  id: string;
  date: string;
  activities: Activity[];
}

interface TravelPlannerProps {
  onNavigate?: (page: 'dashboard' | 'holiday' | 'itinerary' | 'rewards' | 'community' | 'profile') => void;
}

export function TravelPlanner({ onNavigate }: TravelPlannerProps) {
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [tripType, setTripType] = useState('Return');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCabinDialog, setShowCabinDialog] = useState(false);
  const [showTripTypeDialog, setShowTripTypeDialog] = useState(false);
  const [showAirportDialog, setShowAirportDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showItineraryDialog, setShowItineraryDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);

  // Fetch flights from Supabase based on selected destination
  const fetchFlightsFromSupabase = async (arrivalCode: string) => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('arrival_code', arrivalCode)
        .order('is_eco_friendly', { ascending: false })
        .order('carbon_saved', { ascending: false });

      if (error) {
        console.error('Error fetching flights:', error);
        toast.error('Failed to fetch flights from database');
        // Fall back to generated flights
        return generateFlights();
      }

      if (!data || data.length === 0) {
        toast.info('No flights found in database, showing generated flights');
        return generateFlights();
      }

      // Always use generated flights to ensure correct distance-based GP calculation
      console.log('Using generated flights for accurate distance-based GP rewards');
      return generateFlights();
    } catch (error) {
      console.error('Error in fetchFlightsFromSupabase:', error);
      toast.error('Failed to connect to database');
      return generateFlights();
    }
  };

  // Generate flights based on selected destination (fallback)
  const generateFlights = (): Flight[] => {
    if (!destination) return [];

    // Airport coordinates database (from Hong Kong)
    const airportCoordinates: Record<string, { lat: number; lon: number }> = {
      // Hong Kong (origin)
      'HKG': { lat: 22.3080, lon: 113.9185 },
      
      // Asia-Pacific
      'NRT': { lat: 35.7653, lon: 140.3856 }, // Tokyo Narita
      'HND': { lat: 35.5494, lon: 139.7798 }, // Tokyo Haneda
      'SIN': { lat: 1.3644, lon: 103.9915 }, // Singapore
      'ICN': { lat: 37.4602, lon: 126.4407 }, // Seoul
      'SYD': { lat: -33.9399, lon: 151.1753 }, // Sydney
      'BKK': { lat: 13.6900, lon: 100.7501 }, // Bangkok
      'PVG': { lat: 31.1443, lon: 121.8083 }, // Shanghai
      'PEK': { lat: 40.0801, lon: 116.5846 }, // Beijing
      'TPE': { lat: 25.0777, lon: 121.2328 }, // Taipei
      'KUL': { lat: 2.7456, lon: 101.7072 }, // Kuala Lumpur
      'MNL': { lat: 14.5086, lon: 121.0194 }, // Manila
      'DEL': { lat: 28.5665, lon: 77.1031 }, // Delhi
      'BOM': { lat: 19.0896, lon: 72.8656 }, // Mumbai
      'MEL': { lat: -37.6690, lon: 144.8410 }, // Melbourne
      'BNE': { lat: -27.3942, lon: 153.1218 }, // Brisbane
      'PER': { lat: -31.9385, lon: 115.9672 }, // Perth
      'AKL': { lat: -37.0082, lon: 174.7850 }, // Auckland
      'CHC': { lat: -43.4894, lon: 172.5320 }, // Christchurch
      'CGK': { lat: -6.1275, lon: 106.6537 }, // Jakarta
      'DPS': { lat: -8.7467, lon: 115.1667 }, // Bali
      'HAN': { lat: 21.2212, lon: 105.8072 }, // Hanoi
      'SGN': { lat: 10.8188, lon: 106.6519 }, // Ho Chi Minh
      'CAN': { lat: 23.3924, lon: 113.2988 }, // Guangzhou
      'SZX': { lat: 22.6393, lon: 113.8108 }, // Shenzhen
      'CTU': { lat: 30.5785, lon: 103.9470 }, // Chengdu
      'XIY': { lat: 34.4471, lon: 108.7519 }, // Xi'an
      'KIX': { lat: 34.4273, lon: 135.2440 }, // Osaka
      'CTS': { lat: 42.7752, lon: 141.6920 }, // Sapporo
      'FUK': { lat: 33.5859, lon: 130.4511 }, // Fukuoka
      'NGO': { lat: 34.8584, lon: 136.8054 }, // Nagoya
      'BLR': { lat: 13.1979, lon: 77.7063 }, // Bangalore
      'MAA': { lat: 12.9941, lon: 80.1709 }, // Chennai
      'HYD': { lat: 17.2403, lon: 78.4294 }, // Hyderabad
      'CCU': { lat: 22.6547, lon: 88.4467 }, // Kolkata
      'CMB': { lat: 7.1808, lon: 79.8841 }, // Colombo
      'RGN': { lat: 16.9073, lon: 96.1332 }, // Yangon
      'KTM': { lat: 27.6966, lon: 85.3591 }, // Kathmandu
      'DAC': { lat: 23.8433, lon: 90.3978 }, // Dhaka
      'CEB': { lat: 10.3075, lon: 123.9790 }, // Cebu
      
      // Middle East
      'DXB': { lat: 25.2532, lon: 55.3657 }, // Dubai
      'AUH': { lat: 24.4330, lon: 54.6511 }, // Abu Dhabi
      'DOH': { lat: 25.2731, lon: 51.6080 }, // Doha
      'RUH': { lat: 24.9578, lon: 46.6988 }, // Riyadh
      'JED': { lat: 21.6796, lon: 39.1567 }, // Jeddah
      'CAI': { lat: 30.1219, lon: 31.4056 }, // Cairo
      'TLV': { lat: 32.0114, lon: 34.8867 }, // Tel Aviv
      'IST': { lat: 41.2753, lon: 28.7519 }, // Istanbul
      'SAW': { lat: 40.8986, lon: 29.3092 }, // Istanbul Sabiha
      'KWI': { lat: 29.2267, lon: 47.9689 }, // Kuwait
      'BAH': { lat: 26.2708, lon: 50.6336 }, // Bahrain
      'MCT': { lat: 23.5933, lon: 58.2844 }, // Muscat
      'AMM': { lat: 31.7226, lon: 35.9932 }, // Amman
      'BEY': { lat: 33.8209, lon: 35.4884 }, // Beirut
      
      // Europe
      'LHR': { lat: 51.4700, lon: -0.4543 }, // London Heathrow
      'LGW': { lat: 51.1537, lon: -0.1821 }, // London Gatwick
      'LCY': { lat: 51.5048, lon: 0.0495 }, // London City
      'MAN': { lat: 53.3537, lon: -2.2750 }, // Manchester
      'EDI': { lat: 55.9500, lon: -3.3725 }, // Edinburgh
      'CDG': { lat: 49.0097, lon: 2.5479 }, // Paris CDG
      'ORY': { lat: 48.7233, lon: 2.3794 }, // Paris Orly
      'FRA': { lat: 50.0379, lon: 8.5622 }, // Frankfurt
      'MUC': { lat: 48.3538, lon: 11.7861 }, // Munich
      'BER': { lat: 52.3667, lon: 13.5033 }, // Berlin
      'AMS': { lat: 52.3105, lon: 4.7683 }, // Amsterdam
      'MAD': { lat: 40.4983, lon: -3.5676 }, // Madrid
      'BCN': { lat: 41.2974, lon: 2.0833 }, // Barcelona
      'FCO': { lat: 41.8003, lon: 12.2389 }, // Rome
      'MXP': { lat: 45.6301, lon: 8.7231 }, // Milan
      'VCE': { lat: 45.5053, lon: 12.3519 }, // Venice
      'VIE': { lat: 48.1103, lon: 16.5697 }, // Vienna
      'ZRH': { lat: 47.4582, lon: 8.5556 }, // Zurich
      'GVA': { lat: 46.2381, lon: 6.1090 }, // Geneva
      'CPH': { lat: 55.6180, lon: 12.6508 }, // Copenhagen
      'OSL': { lat: 60.1939, lon: 11.1004 }, // Oslo
      'ARN': { lat: 59.6519, lon: 17.9186 }, // Stockholm
      'HEL': { lat: 60.3172, lon: 24.9633 }, // Helsinki
      'DUB': { lat: 53.4213, lon: -6.2701 }, // Dublin
      'BRU': { lat: 50.9010, lon: 4.4856 }, // Brussels
      'LIS': { lat: 38.7742, lon: -9.1342 }, // Lisbon
      'ATH': { lat: 37.9364, lon: 23.9445 }, // Athens
      'PRG': { lat: 50.1008, lon: 14.2632 }, // Prague
      'WAW': { lat: 52.1657, lon: 20.9671 }, // Warsaw
      'BUD': { lat: 47.4398, lon: 19.2611 }, // Budapest
      
      // North America
      'JFK': { lat: 40.6413, lon: -73.7781 }, // New York JFK
      'EWR': { lat: 40.6895, lon: -74.1745 }, // Newark
      'LAX': { lat: 33.9416, lon: -118.4085 }, // Los Angeles
      'SFO': { lat: 37.6213, lon: -122.3790 }, // San Francisco
      'ORD': { lat: 41.9742, lon: -87.9073 }, // Chicago
      'DFW': { lat: 32.8998, lon: -97.0403 }, // Dallas
      'IAH': { lat: 29.9902, lon: -95.3368 }, // Houston
      'MIA': { lat: 25.7959, lon: -80.2870 }, // Miami
      'BOS': { lat: 42.3656, lon: -71.0096 }, // Boston
      'SEA': { lat: 47.4502, lon: -122.3088 }, // Seattle
      'YYZ': { lat: 43.6777, lon: -79.6248 }, // Toronto
      'YVR': { lat: 49.1967, lon: -123.1815 }, // Vancouver
      'YUL': { lat: 45.4707, lon: -73.7408 }, // Montreal
      'MEX': { lat: 19.4363, lon: -99.0721 }, // Mexico City
      
      // South America
      'GRU': { lat: -23.4356, lon: -46.4731 }, // São Paulo
      'GIG': { lat: -22.8099, lon: -43.2505 }, // Rio de Janeiro
      'EZE': { lat: -34.8222, lon: -58.5358 }, // Buenos Aires
      'SCL': { lat: -33.3930, lon: -70.7858 }, // Santiago
      'BOG': { lat: 4.7016, lon: -74.1469 }, // Bogotá
      'LIM': { lat: -12.0219, lon: -77.1143 }, // Lima
      
      // Africa
      'JNB': { lat: -26.1392, lon: 28.2460 }, // Johannesburg
      'CPT': { lat: -33.9715, lon: 18.6021 }, // Cape Town
      'NBO': { lat: -1.3192, lon: 36.9278 }, // Nairobi
      'ADD': { lat: 8.9806, lon: 38.7996 }, // Addis Ababa
      'LOS': { lat: 6.5774, lon: 3.3212 }, // Lagos
      'ACC': { lat: 5.6052, lon: -0.1703 }, // Accra
    };

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Get distance to destination
    const origin = airportCoordinates['HKG'];
    const dest = airportCoordinates[destination.code];
    
    // If destination coordinates not found, use default distance based on region
    let distance = 2500; // default medium-haul
    if (dest) {
      distance = calculateDistance(origin.lat, origin.lon, dest.lat, dest.lon);
    }

    // ===== PRICING IN HKD =====
    // Cabin class price multipliers
    const cabinMultipliers: Record<string, number> = {
      'Economy': 1.0,
      'Premium Economy': 1.8,
      'Business': 4.5,
      'First': 8.0,
    };

    // Get cabin multiplier
    const cabinMultiplier = cabinMultipliers[cabinClass] || 1.0;

    // Base price per km (in HKD - converted from $0.12 USD × 7.8)
    let pricePerKm = 0.94; // ~HKD 0.94 per km
    
    // Distance-based discount (longer flights = cheaper per km)
    if (distance > 8000) pricePerKm *= 0.85; // 15% discount for ultra-long haul
    else if (distance > 5000) pricePerKm *= 0.92; // 8% discount for long haul
    else if (distance > 3000) pricePerKm *= 0.95; // 5% discount for medium-long haul

    // Calculate base price for one-way in HKD
    const basePrice = Math.round(distance * pricePerKm * cabinMultiplier);

    // ===== CO₂ EMISSIONS (Based on realistic data) =====
    // Realistic CO₂ emissions for Economy class based on distance
    let baseCO2Economy = 0;
    
    if (distance < 500) {
      // Very short-haul: 90-115 kg
      baseCO2Economy = 90 + (distance / 500) * 25;
    } else if (distance < 1500) {
      // Short-haul: 230-290 kg (e.g., HKG-Tokyo 2,900 km → 230-290 kg)
      // Scale from 115 at 500km to 290 at 1500km
      baseCO2Economy = 115 + ((distance - 500) / 1000) * 175;
    } else if (distance < 4000) {
      // Medium-haul: 205-260 kg (e.g., HKG-Singapore 2,585 km → 205-260 kg)
      baseCO2Economy = 205 + ((distance - 1500) / 2500) * 55;
    } else if (distance < 8000) {
      // Long-haul: 870-1,000 kg (e.g., HKG-London 9,650 km → 870-1,000 kg)
      baseCO2Economy = 870 + ((distance - 4000) / 4000) * 130;
    } else {
      // Ultra-long-haul: 990-1,300 kg
      // HKG-New York (12,980 km): 1,100-1,300 kg
      // HKG-Los Angeles (11,645 km): 990-1,170 kg
      baseCO2Economy = 990 + ((distance - 8000) / 5000) * 310;
    }

    // Round to nearest kg
    baseCO2Economy = Math.round(baseCO2Economy);

    // Cabin class CO₂ multipliers (premium cabins take more space = more CO₂ per passenger)
    const cabinCO2Factors: Record<string, number> = {
      'Economy': 1.0,
      'Premium Economy': 1.4,
      'Business': 2.2,
      'First': 3.5,
    };
    
    const cabinCO2Factor = cabinCO2Factors[cabinClass] || 1.0;

    // Calculate actual CO₂ for selected cabin class
    const actualCO2 = Math.round(baseCO2Economy * cabinCO2Factor);

    // ===== CARBON SAVED =====
    // Baseline: older, less efficient aircraft (60% more emissions)
    const baselineCO2 = Math.round(actualCO2 * 1.6);
    const carbonSaved = baselineCO2 - actualCO2;

    // ===== GREEN POINTS CALCULATION =====
    // For eco-friendly flights: 180 GP (shortest) to 500 GP (longest) based on distance
    // For regular flights: 0 GP (no rewards)
    
    const minDistance = 0;      // Shortest possible flight
    const maxDistance = 13000;  // Ultra-long haul (e.g., HKG to New York is ~13,000 km)
    
    // Calculate eco-friendly flight GP (180-500 range)
    const ecoFlightGP = 180 + ((distance - minDistance) / (maxDistance - minDistance)) * 320;
    const sustainableFlightGP = Math.max(180, Math.min(500, Math.round(ecoFlightGP)));
    
    // Regular flights earn 0 GP
    const baseGreenPoints = 0;

    // Generate 5 flight options with time/price variations
    const flights: Flight[] = [];
    const flightTimes = [
      { dep: '08:30', arr: '13:45', offset: 1500 },  // Early morning
      { dep: '11:15', arr: '16:30', offset: 800 },   // Mid-morning
      { dep: '14:45', arr: '20:00', offset: 400 },   // Afternoon (best value)
      { dep: '18:20', arr: '23:35', offset: 1200 },  // Evening
      { dep: '22:30', arr: '03:45', offset: -400 },  // Red-eye (cheapest)
    ];

    for (let i = 0; i < 5; i++) {
      const flightTime = flightTimes[i];
      const priceVariation = flightTime.offset + (Math.random() * 800 - 400); // Add some randomness (in HKD)
      const finalPrice = Math.round(basePrice + priceVariation);
      
      // Mark first two flights as eco-friendly (using SAF - Sustainable Aviation Fuel)
      const isEcoFriendly = i < 2;
      
      // Eco-friendly flights save 20% more carbon (using SAF)
      const ecoBonus = isEcoFriendly ? 1.2 : 1.0;
      const flightCarbonSaved = Math.round(carbonSaved * ecoBonus);
      
      // Calculate Green Points with sustainable bonus only for eco-friendly flights
      const flightGreenPoints = Math.round(isEcoFriendly ? sustainableFlightGP : baseGreenPoints);
      
      // Calculate actual arrival time based on duration
      const durationHours = Math.floor(distance / 850);
      const durationMinutes = Math.round((distance / 850 % 1) * 60);
      
      flights.push({
        id: (i + 1).toString(),
        flightNumber: `CX ${500 + i * 2}`,
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: flightTime.dep,
        arrivalTime: flightTime.arr,
        duration: `${durationHours}h ${durationMinutes}m`,
        carbonSaved: flightCarbonSaved,
        greenPoints: flightGreenPoints,
        price: finalPrice,
        isEcoFriendly: isEcoFriendly,
      });
    }

    return flights;
  };

  const handleSearch = () => {
    if (destination && departureDate) {
      setLoading(true);
      toast.success('Searching flights...', {
        description: `Looking for flights to ${destination.city}`,
      });
      setTimeout(() => {
        const arrivalCode = destination.code;
        fetchFlightsFromSupabase(arrivalCode).then((fetchedFlights) => {
          setFlights(fetchedFlights);
          setShowResults(true);
          setLoading(false);
        });
      }, 2000);
    }
  };

  const handleCabinConfirm = (cabin: string, adultsCount: number, childrenCount: number) => {
    setCabinClass(cabin);
    setAdults(adultsCount);
    setChildren(childrenCount);
  };

  const handleTripTypeConfirm = (type: string) => {
    setTripType(type);
  };

  const handleAirportSelect = (airport: Airport) => {
    setDestination(airport);
  };

  const handleDiscountApply = (code: string, discount: number) => {
    setDiscountCode(code);
    setDiscountPercentage(discount);
    toast.success(`Discount code ${code} applied!`, {
      description: `You'll save ${discount}% on your booking`,
    });
  };

  const calculateDiscountedPrice = (price: number) => {
    if (discountPercentage > 0) {
      return Math.round(price * (1 - discountPercentage / 100));
    }
    return price;
  };

  // Handle flight booking - Direct booking without sustainable options
  const handleBookFlight = (flight: Flight) => {
    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }

    // Check if return date is required for return trips
    if (tripType === 'Return' && !returnDate) {
      toast.error('Please select a return date for your return trip');
      return;
    }

    // Validate return date is not before departure date
    if (tripType === 'Return' && returnDate && returnDate < departureDate) {
      toast.error('Invalid dates', {
        description: 'Return date cannot be earlier than departure date',
      });
      return;
    }

    // Complete booking directly
    completeBooking(flight);
  };

  // Complete the flight booking
  const completeBooking = (flight: Flight) => {
    try {
      // Get existing itineraries from localStorage
      const stored = localStorage.getItem('savedItineraries');
      const existingItineraries = stored ? JSON.parse(stored) : [];

      // Extract destination from arrival airport
      const destinationMatch = flight.arrival.match(/^(.+?)\s*\(/);
      const destination = destinationMatch ? destinationMatch[1].trim() : flight.arrival;

      // Format dates for display
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      // Calculate number of days for the trip
      const tripDays = returnDate 
        ? Math.ceil((returnDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 3; // Default to 3 days if no return date

      // Generate initial day plans
      const generateInitialDayPlans = (startDate: Date, numberOfDays: number): DayPlan[] => {
        const plans: DayPlan[] = [];
        
        for (let i = 0; i < numberOfDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Create empty activities array - no preset activities
          const activities: Activity[] = [];
          
          plans.push({
            id: `day-${i + 1}`,
            date: dateStr,
            activities: activities
          });
        }
        
        return plans;
      };

      const dayPlans = generateInitialDayPlans(departureDate, tripDays);

      // Create flights array - for return trips, create both outbound and return flights
      const flights = [];
      
      // Outbound flight (selected flight)
      flights.push({
        type: 'outbound',
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        departure: flight.departure,
        arrival: flight.arrival,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        date: formatDate(departureDate),
        carbonSaved: flight.carbonSaved,
        greenPoints: flight.greenPoints,
        isEcoFriendly: flight.isEcoFriendly,
      });

      // Return flight (if it's a return trip)
      let totalGreenPoints = flight.greenPoints;
      if (tripType === 'Return' && returnDate) {
        // Generate return flight number (increment last digit or add R suffix)
        const returnFlightNumber = flight.flightNumber.replace(/(\d+)$/, (match) => {
          const num = parseInt(match);
          return (num + 1).toString();
        });

        // Return flight has reversed route
        const returnFlight = {
          type: 'return',
          flightNumber: returnFlightNumber,
          airline: flight.airline,
          departure: flight.arrival, // Reversed
          arrival: flight.departure, // Reversed
          departureTime: flight.arrivalTime, // Same times but reversed
          arrivalTime: flight.departureTime,
          duration: flight.duration,
          date: formatDate(returnDate),
          carbonSaved: flight.carbonSaved, // Same carbon savings
          greenPoints: flight.greenPoints, // Same green points
          isEcoFriendly: flight.isEcoFriendly,
        };
        
        flights.push(returnFlight);
        totalGreenPoints += flight.greenPoints; // Double the points for return trip
      }

      // Create new itinerary object
      const newItinerary = {
        id: `itinerary-${Date.now()}`,
        destination: destination,
        tripType: tripType,
        flights: flights, // Array of flight objects
        flightNumber: flight.flightNumber, // Keep for backward compatibility
        departure: flight.departure,
        arrival: flight.arrival,
        departureDate: formatDate(departureDate),
        returnDate: returnDate ? formatDate(returnDate) : undefined,
        greenPoints: totalGreenPoints, // Total points from all flights
        isEcoFriendly: flight.isEcoFriendly,
        savedDate: new Date().toISOString(),
        dayPlans: dayPlans,
      };

      // Add to existing itineraries
      const updatedItineraries = [...existingItineraries, newItinerary];

      // Save to localStorage
      localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));

      // Update green points balance
      const currentBalance = localStorage.getItem('greenPointsBalance');
      const currentPoints = currentBalance ? parseInt(currentBalance) : 680;
      const newBalance = currentPoints + totalGreenPoints;
      localStorage.setItem('greenPointsBalance', newBalance.toString());

      // Update accumulated points
      const currentAccumulated = localStorage.getItem('greenPointsAccumulated');
      const accumulatedPoints = currentAccumulated ? parseInt(currentAccumulated) : 2840;
      const newAccumulated = accumulatedPoints + totalGreenPoints;
      localStorage.setItem('greenPointsAccumulated', newAccumulated.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('itinerariesUpdated'));
      window.dispatchEvent(new Event('greenPointsUpdated'));

      const flightMessage = tripType === 'Return' 
        ? `${flights.length} flights booked (outbound + return)`
        : 'Flight booked';

      toast.success(`${flightMessage} successfully!`, {
        description: `+${totalGreenPoints} GreenPoints earned! Opening your itinerary...`,
      });
      
      // Navigate to Itinerary page
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('itinerary');
        }, 500);
      }
    } catch (error) {
      console.error('Error booking flight:', error);
      toast.error('Failed to book flight');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="tracking-wide">Book Your Holiday</h1>
            <div className="text-xs opacity-90 mt-1 flex items-center gap-2">
              <Leaf className="h-3 w-3" />
              Find eco-friendly flights
            </div>
          </div>
          <div className="text-xs opacity-90 uppercase tracking-wider">Cathay</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Booking Form with enhanced design */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Decorative top border */}
          <div className="h-1 bg-gradient-to-r from-primary via-green-500 to-primary"></div>
          
          <div className="p-6">
            {/* Grid Layout matching design */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Leaving from */}
              <div className="border-2 border-gray-200 rounded-xl p-3 relative bg-gradient-to-br from-gray-50 to-white hover:border-primary/50 transition-colors">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Leaving from</div>
                <div className="text-sm">Hong Kong, (HKG)</div>
                <Plane className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              </div>

              {/* Going to */}
              <div 
                className="border-2 border-gray-200 rounded-xl p-3 cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:shadow-md transition-all"
                onClick={() => setShowAirportDialog(true)}
              >
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Going to</div>
                <div className="text-sm">
                  {destination ? `${destination.city} (${destination.code})` : 'Select a destination'}
                </div>
              </div>

              {/* Trip type */}
              <div 
                className="border-2 border-gray-200 rounded-xl p-3 relative cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:shadow-md transition-all"
                onClick={() => setShowTripTypeDialog(true)}
              >
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Trip type</div>
                <div className="text-sm">{tripType}</div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              </div>

              {/* Cabin class and passengers */}
              <div 
                className="border-2 border-gray-200 rounded-xl p-3 relative cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:shadow-md transition-all"
                onClick={() => setShowCabinDialog(true)}
              >
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Cabin class and passengers</div>
                <div className="text-sm">{cabinClass}, {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}</div>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Date Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Departing on */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="border-2 border-gray-200 rounded-xl p-3 relative cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:shadow-md transition-all">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Departing on</div>
                    <div className="text-sm">
                      {departureDate ? format(departureDate, 'PPP') : 'Select a date'}
                    </div>
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Returning on */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="border-2 border-gray-200 rounded-xl p-3 relative cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:shadow-md transition-all">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Returning on</div>
                    <div className="text-sm">
                      {returnDate ? format(returnDate, 'PPP') : 'Select a date'}
                    </div>
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => {
                      // Disable dates before departure date
                      if (departureDate && date < departureDate) {
                        return true;
                      }
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Discount code and Search Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col gap-1">
                <button 
                  className="text-primary text-sm flex items-center gap-1 hover:underline" 
                  onClick={() => setShowDiscountDialog(true)}
                >
                  {discountCode ? `Code: ${discountCode} (${discountPercentage}% off)` : 'Add a discount code →'}
                </button>
                {discountCode && (
                  <button
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setDiscountCode('');
                      setDiscountPercentage(0);
                      toast.info('Discount code removed');
                    }}
                  >
                    Remove code
                  </button>
                )}
              </div>
              <Button 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all px-8 rounded-xl"
                onClick={handleSearch}
                disabled={!destination || !departureDate}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search flights'}
              </Button>
            </div>
          </div>
        </div>

        {/* Flight Results */}
        {showResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <h2 className="text-primary">Available Flights</h2>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 border-green-200">
                Sorted by Carbon Efficiency
              </Badge>
            </div>

            {flights.map((flight, index) => (
              <Card 
                key={flight.id}
                className={`shadow-md transition-all hover:shadow-lg ${
                  flight.isEcoFriendly 
                    ? 'border-2 border-green-500/50 bg-green-50/30' 
                    : 'border-border'
                }`}
              >
                <CardContent className="p-4">
                  {/* Flight Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{flight.flightNumber}</span>
                        {index === 0 && (
                          <Badge className="bg-green-600 text-white border-0">
                            <Award className="h-3 w-3 mr-1" />
                            Most Efficient
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{flight.airline}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl text-primary">HK${calculateDiscountedPrice(flight.price)}</div>
                      <div className="text-xs text-muted-foreground">per person</div>
                    </div>
                  </div>

                  {/* Route and Time */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Departure</div>
                      <div className="text-sm">{flight.departure}</div>
                      <div className="text-lg">{flight.departureTime}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <Plane className="h-4 w-4 text-primary rotate-90 mb-1" />
                      <div className="text-xs text-muted-foreground">{flight.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Arrival</div>
                      <div className="text-sm">{flight.arrival}</div>
                      <div className="text-lg">{flight.arrivalTime}</div>
                    </div>
                  </div>

                  {/* Eco Benefits */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 p-3 rounded-lg bg-green-100 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-green-700" />
                        <span className="text-xs text-green-700">Carbon Saved</span>
                      </div>
                      <div className="text-lg text-green-700">{flight.carbonSaved} kg</div>
                      <div className="text-xs text-green-600">vs standard flights</div>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="h-4 w-4 text-primary" />
                        <span className="text-xs text-primary">You'll Earn</span>
                      </div>
                      <div className="text-lg text-primary">+{flight.greenPoints} GP</div>
                      <div className="text-xs text-primary/70">GreenPoints</div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <Button 
                    className={`w-full ${
                      flight.isEcoFriendly 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    onClick={() => handleBookFlight(flight)}
                  >
                    {flight.isEcoFriendly ? 'Book Eco-Flight' : 'Book Flight'}
                  </Button>

                  {/* Eco Badge */}
                  {flight.isEcoFriendly && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-xs text-green-700">
                      <Leaf className="h-3 w-3" />
                      <span>This flight uses sustainable aviation fuel (SAF)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CabinPassengerSelector
        open={showCabinDialog}
        onOpenChange={setShowCabinDialog}
        cabinClass={cabinClass}
        adults={adults}
        children={children}
        onConfirm={handleCabinConfirm}
      />
      <TripTypeSelector
        open={showTripTypeDialog}
        onOpenChange={setShowTripTypeDialog}
        tripType={tripType}
        onConfirm={handleTripTypeConfirm}
      />
      <AirportSelector
        open={showAirportDialog}
        onOpenChange={setShowAirportDialog}
        onSelect={handleAirportSelect}
      />
      <DiscountCodeDialog
        open={showDiscountDialog}
        onOpenChange={setShowDiscountDialog}
        onApplyCode={handleDiscountApply}
      />
      <ItineraryPlannerDialog
        open={showItineraryDialog}
        onOpenChange={setShowItineraryDialog}
        flightInfo={selectedFlight ? {
          flightNumber: selectedFlight.flightNumber,
          departure: selectedFlight.departure,
          arrival: selectedFlight.arrival,
          greenPoints: selectedFlight.greenPoints,
        } : undefined}
        departureDate={departureDate}
        returnDate={returnDate}
      />
    </div>
  );
}