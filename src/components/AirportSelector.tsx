import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Plane, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (airport: Airport) => void;
  title?: string;
}

export function AirportSelector({
  open,
  onOpenChange,
  onSelect,
  title = 'Select Airport',
}: AirportSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch airports from Supabase when dialog opens
  useEffect(() => {
    if (open) {
      fetchAirports();
    }
  }, [open]);

  // Filter airports based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAirports(airports);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = airports.filter(
        (airport) =>
          airport.code.toLowerCase().includes(query) ||
          airport.name.toLowerCase().includes(query) ||
          airport.city.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
      );
      setFilteredAirports(filtered);
    }
  }, [searchQuery, airports]);

  const fetchAirports = async () => {
    setIsLoading(true);
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, using fallback airports');
        setAirports(fallbackAirports);
        setFilteredAirports(fallbackAirports);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setAirports(data);
        setFilteredAirports(data);
      } else {
        // If no data in Supabase, use fallback data
        setAirports(fallbackAirports);
        setFilteredAirports(fallbackAirports);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
      // Use fallback data on error
      setAirports(fallbackAirports);
      setFilteredAirports(fallbackAirports);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Search by city, airport name, or code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search airports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Airport List */}
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading airports...</div>
              </div>
            ) : filteredAirports.length > 0 ? (
              <div className="space-y-1">
                {filteredAirports.map((airport) => (
                  <button
                    key={airport.id}
                    onClick={() => handleSelect(airport)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                        <Plane className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium">{airport.city}</span>
                          <span className="text-sm text-primary">({airport.code})</span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {airport.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {airport.country}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <div>No airports found</div>
                <div className="text-sm">Try a different search term</div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Fallback airports data in case Supabase doesn't have data
const fallbackAirports: Airport[] = [
  // Asia-Pacific
  { id: 1, code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong SAR' },
  { id: 2, code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { id: 3, code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { id: 4, code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { id: 5, code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { id: 6, code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { id: 7, code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { id: 8, code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  { id: 9, code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  { id: 10, code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },
  { id: 11, code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { id: 12, code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
  { id: 13, code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India' },
  { id: 14, code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { id: 15, code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { id: 16, code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  { id: 17, code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  { id: 18, code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  { id: 19, code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },
  { id: 20, code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  { id: 21, code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia' },
  { id: 22, code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam' },
  { id: 23, code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { id: 24, code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China' },
  { id: 25, code: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', country: 'China' },
  { id: 26, code: 'CTU', name: 'Chengdu Shuangliu International Airport', city: 'Chengdu', country: 'China' },
  { id: 27, code: 'XIY', name: 'Xi\'an Xianyang International Airport', city: 'Xi\'an', country: 'China' },
  { id: 28, code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan' },
  { id: 29, code: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', country: 'Japan' },
  { id: 30, code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan' },
  { id: 31, code: 'NGO', name: 'Chubu Centrair International Airport', city: 'Nagoya', country: 'Japan' },
  { id: 32, code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India' },
  { id: 33, code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { id: 34, code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India' },
  { id: 35, code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India' },
  { id: 36, code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka' },
  { id: 37, code: 'RGN', name: 'Yangon International Airport', city: 'Yangon', country: 'Myanmar' },
  { id: 38, code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal' },
  { id: 39, code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh' },
  { id: 40, code: 'CEB', name: 'Mactan-Cebu International Airport', city: 'Cebu', country: 'Philippines' },
  
  // Middle East
  { id: 41, code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { id: 42, code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  { id: 43, code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { id: 44, code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  { id: 45, code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { id: 46, code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { id: 47, code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel' },
  { id: 48, code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { id: 49, code: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Turkey' },
  { id: 50, code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait' },
  { id: 51, code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain' },
  { id: 52, code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman' },
  { id: 53, code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan' },
  { id: 54, code: 'BEY', name: 'Rafic Hariri International Airport', city: 'Beirut', country: 'Lebanon' },
  
  // Europe
  { id: 55, code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { id: 56, code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { id: 57, code: 'LCY', name: 'London City Airport', city: 'London', country: 'United Kingdom' },
  { id: 58, code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
  { id: 59, code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom' },
  { id: 60, code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { id: 61, code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France' },
  { id: 62, code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { id: 63, code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { id: 64, code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
  { id: 65, code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { id: 66, code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
  { id: 67, code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { id: 68, code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy' },
  { id: 69, code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy' },
  { id: 70, code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy' },
  { id: 71, code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { id: 72, code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
  { id: 73, code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { id: 74, code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { id: 75, code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { id: 76, code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  { id: 77, code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
  { id: 78, code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland' },
  { id: 79, code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { id: 80, code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal' },
  { id: 81, code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  { id: 82, code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic' },
  { id: 83, code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { id: 84, code: 'BUD', name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest', country: 'Hungary' },
  { id: 85, code: 'OTP', name: 'Henri Coandă International Airport', city: 'Bucharest', country: 'Romania' },
  { id: 86, code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow', country: 'Russia' },
  { id: 87, code: 'DME', name: 'Domodedovo International Airport', city: 'Moscow', country: 'Russia' },
  { id: 88, code: 'LED', name: 'Pulkovo Airport', city: 'St. Petersburg', country: 'Russia' },
  
  // North America
  { id: 89, code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { id: 90, code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States' },
  { id: 91, code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States' },
  { id: 92, code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { id: 93, code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { id: 94, code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States' },
  { id: 95, code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  { id: 96, code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States' },
  { id: 97, code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States' },
  { id: 98, code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
  { id: 99, code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States' },
  { id: 100, code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States' },
  { id: 101, code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States' },
  { id: 102, code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  { id: 103, code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
  { id: 104, code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States' },
  { id: 105, code: 'PDX', name: 'Portland International Airport', city: 'Portland', country: 'United States' },
  { id: 106, code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States' },
  { id: 107, code: 'DTW', name: 'Detroit Metropolitan Airport', city: 'Detroit', country: 'United States' },
  { id: 108, code: 'MSP', name: 'Minneapolis-St Paul International Airport', city: 'Minneapolis', country: 'United States' },
  { id: 109, code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'United States' },
  { id: 110, code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { id: 111, code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  { id: 112, code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada' },
  { id: 113, code: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada' },
  { id: 114, code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
  { id: 115, code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico' },
  { id: 116, code: 'GDL', name: 'Guadalajara International Airport', city: 'Guadalajara', country: 'Mexico' },
  
  // South America
  { id: 117, code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  { id: 118, code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
  { id: 119, code: 'BSB', name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil' },
  { id: 120, code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina' },
  { id: 121, code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
  { id: 122, code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },
  { id: 123, code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  { id: 124, code: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador' },
  { id: 125, code: 'CCS', name: 'Simón Bolívar International Airport', city: 'Caracas', country: 'Venezuela' },
  
  // Africa
  { id: 126, code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { id: 127, code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { id: 128, code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa' },
  { id: 129, code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  { id: 130, code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  { id: 131, code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  { id: 132, code: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana' },
  { id: 133, code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
  { id: 134, code: 'TUN', name: 'Tunis-Carthage International Airport', city: 'Tunis', country: 'Tunisia' },
  { id: 135, code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
  { id: 136, code: 'DAR', name: 'Julius Nyerere International Airport', city: 'Dar es Salaam', country: 'Tanzania' },
  { id: 137, code: 'EBB', name: 'Entebbe International Airport', city: 'Entebbe', country: 'Uganda' },
  { id: 138, code: 'MRU', name: 'Sir Seewoosagur Ramgoolam International Airport', city: 'Mauritius', country: 'Mauritius' },
  { id: 139, code: 'SEZ', name: 'Seychelles International Airport', city: 'Mahé', country: 'Seychelles' },
  { id: 140, code: 'TNR', name: 'Ivato International Airport', city: 'Antananarivo', country: 'Madagascar' },
];