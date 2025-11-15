import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Plane, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Users, 
  Leaf, 
  TrendingDown,
  Award,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
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
  onNavigate?: (page: 'dashboard' | 'holiday' | 'itinerary' | 'rewards' | 'community' | 'testing') => void;
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

      // Transform Supabase data to Flight interface
      return data.map((dbFlight: any) => ({
        id: dbFlight.id,
        flightNumber: dbFlight.flight_number,
        airline: dbFlight.airline,
        departure: `${dbFlight.departure_city} (${dbFlight.departure_code})`,
        arrival: `${dbFlight.arrival_city} (${dbFlight.arrival_code})`,
        departureTime: dbFlight.departure_time,
        arrivalTime: dbFlight.arrival_time,
        duration: dbFlight.duration,
        carbonSaved: dbFlight.carbon_saved,
        greenPoints: dbFlight.green_points,
        price: dbFlight.base_price,
        isEcoFriendly: dbFlight.is_eco_friendly,
      }));
    } catch (error) {
      console.error('Error in fetchFlightsFromSupabase:', error);
      toast.error('Failed to connect to database');
      return generateFlights();
    }
  };

  // Generate flights based on selected destination (fallback)
  const generateFlights = (): Flight[] => {
    if (!destination) return [];

    const basePrice = 3500 + Math.floor(Math.random() * 1000);
    
    return [
      {
        id: '1',
        flightNumber: 'CX 500',
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: '10:30',
        arrivalTime: '15:45',
        duration: '4h 15m',
        carbonSaved: 145,
        greenPoints: 85,
        price: basePrice + 700,
        isEcoFriendly: true
      },
      {
        id: '2',
        flightNumber: 'CX 502',
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: '14:20',
        arrivalTime: '19:50',
        duration: '4h 30m',
        carbonSaved: 128,
        greenPoints: 75,
        price: basePrice + 450,
        isEcoFriendly: true
      },
      {
        id: '3',
        flightNumber: 'CX 504',
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: '08:15',
        arrivalTime: '13:30',
        duration: '4h 15m',
        carbonSaved: 112,
        greenPoints: 65,
        price: basePrice + 600,
        isEcoFriendly: false
      },
      {
        id: '4',
        flightNumber: 'CX 506',
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: '17:45',
        arrivalTime: '23:10',
        duration: '4h 25m',
        carbonSaved: 98,
        greenPoints: 55,
        price: basePrice + 350,
        isEcoFriendly: false
      },
      {
        id: '5',
        flightNumber: 'CX 508',
        airline: 'Cathay Pacific',
        departure: 'Hong Kong (HKG)',
        arrival: `${destination.city} (${destination.code})`,
        departureTime: '19:30',
        arrivalTime: '00:55',
        duration: '4h 25m',
        carbonSaved: 85,
        greenPoints: 50,
        price: basePrice + 250,
        isEcoFriendly: false
      }
    ];
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

  // Handle flight booking and navigate to itinerary
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