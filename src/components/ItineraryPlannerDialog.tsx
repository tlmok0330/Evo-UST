import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DayPlan, Activity } from './TravelPlanner';
import { ItineraryView } from './ItineraryView';
import { MapView } from './MapView';
import { AddActivityDialog } from './AddActivityDialog';
import { Map, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ItineraryPlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightInfo?: {
    flightNumber: string;
    departure: string;
    arrival: string;
    greenPoints: number;
  };
  departureDate?: Date;
  returnDate?: Date;
}

// Destination-specific activity suggestions
const getDestinationActivities = (arrivalCity: string) => {
  const cityName = arrivalCity.split('(')[0].trim();
  
  const destinationData: Record<string, any> = {
    'Tokyo': {
      arrivalLocation: 'Narita Airport (NRT)',
      hotelDistrict: 'Shibuya District',
      activities: [
        { title: 'Visit Senso-ji Temple', time: '09:00', location: 'Asakusa' },
        { title: 'Sustainable Food Tour', time: '13:00', location: 'Tsukiji Outer Market', isEcoFriendly: true },
        { title: 'Meiji Shrine', time: '10:00', location: 'Shibuya' },
      ],
      departureAirport: 'Haneda Airport (HND)'
    },
    'Singapore': {
      arrivalLocation: 'Changi Airport (SIN)',
      hotelDistrict: 'Marina Bay',
      activities: [
        { title: 'Gardens by the Bay', time: '09:00', location: 'Marina Bay', isEcoFriendly: true },
        { title: 'Sustainable Hawker Tour', time: '13:00', location: 'Chinatown', isEcoFriendly: true },
        { title: 'Marina Bay Sands', time: '10:00', location: 'Marina Bay' },
      ],
      departureAirport: 'Changi Airport (SIN)'
    },
    'London': {
      arrivalLocation: 'Heathrow Airport (LHR)',
      hotelDistrict: 'Westminster',
      activities: [
        { title: 'British Museum', time: '09:00', location: 'Bloomsbury' },
        { title: 'Thames River Cruise', time: '13:00', location: 'Westminster Pier', isEcoFriendly: true },
        { title: 'Tower of London', time: '10:00', location: 'Tower Hill' },
      ],
      departureAirport: 'Heathrow Airport (LHR)'
    },
    'Sydney': {
      arrivalLocation: 'Sydney Airport (SYD)',
      hotelDistrict: 'Circular Quay',
      activities: [
        { title: 'Sydney Opera House Tour', time: '09:00', location: 'Bennelong Point' },
        { title: 'Bondi Beach & Coastal Walk', time: '13:00', location: 'Bondi', isEcoFriendly: true },
        { title: 'Sydney Harbour Bridge', time: '10:00', location: 'The Rocks' },
      ],
      departureAirport: 'Sydney Airport (SYD)'
    },
    'San Francisco': {
      arrivalLocation: 'San Francisco Airport (SFO)',
      hotelDistrict: 'Union Square',
      activities: [
        { title: 'Golden Gate Bridge', time: '09:00', location: 'Golden Gate Park', isEcoFriendly: true },
        { title: 'Sustainable Food Tour', time: '13:00', location: 'Ferry Building', isEcoFriendly: true },
        { title: 'Alcatraz Island', time: '10:00', location: 'Fisherman\'s Wharf' },
      ],
      departureAirport: 'San Francisco Airport (SFO)'
    },
    'Bangkok': {
      arrivalLocation: 'Suvarnabhumi Airport (BKK)',
      hotelDistrict: 'Sukhumvit',
      activities: [
        { title: 'Grand Palace', time: '09:00', location: 'Phra Nakhon' },
        { title: 'Sustainable Thai Cooking Class', time: '13:00', location: 'Thonglor', isEcoFriendly: true },
        { title: 'Wat Pho Temple', time: '10:00', location: 'Phra Nakhon' },
      ],
      departureAirport: 'Suvarnabhumi Airport (BKK)'
    },
    'Seoul': {
      arrivalLocation: 'Incheon Airport (ICN)',
      hotelDistrict: 'Gangnam',
      activities: [
        { title: 'Gyeongbokgung Palace', time: '09:00', location: 'Jongno District' },
        { title: 'Traditional Market Tour', time: '13:00', location: 'Insadong', isEcoFriendly: true },
        { title: 'N Seoul Tower', time: '10:00', location: 'Namsan' },
      ],
      departureAirport: 'Incheon Airport (ICN)'
    },
  };

  // Default fallback for unknown destinations
  return destinationData[cityName] || {
    arrivalLocation: arrivalCity,
    hotelDistrict: 'City Center',
    activities: [
      { title: 'City Exploration', time: '09:00', location: 'Downtown' },
      { title: 'Local Food Tour', time: '13:00', location: 'Local Market', isEcoFriendly: true },
      { title: 'Cultural Site Visit', time: '10:00', location: 'Historic District' },
    ],
    departureAirport: arrivalCity
  };
};

export function ItineraryPlannerDialog({ open, onOpenChange, flightInfo, departureDate, returnDate }: ItineraryPlannerDialogProps) {
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  
  // Initialize activities based on flight destination
  useEffect(() => {
    if (flightInfo && open) {
      const destData = getDestinationActivities(flightInfo.arrival);
      
      // Calculate date strings from the provided dates
      const formatDateStr = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const day1Date = departureDate ? formatDateStr(departureDate) : '2025-11-20';
      
      // Calculate day 2 and day 3 dates
      const day2 = new Date(day1Date);
      day2.setDate(day2.getDate() + 1);
      const day2Date = formatDateStr(day2);
      
      const day3 = new Date(day1Date);
      day3.setDate(day3.getDate() + 2);
      const day3Date = formatDateStr(day3);
      
      const initialPlans: DayPlan[] = [
        {
          id: 'day-1',
          date: day1Date,
          activities: [
            {
              id: 'act-1',
              title: `Arrive in ${flightInfo.arrival.split('(')[0].trim()}`,
              time: '15:45',
              location: destData.arrivalLocation,
              isPinned: true,
            },
            {
              id: 'act-2',
              title: 'Check in to Eco Hotel',
              time: '17:30',
              location: destData.hotelDistrict,
              isPinned: true,
              isEcoFriendly: true,
            },
          ],
        },
        {
          id: 'day-2',
          date: day2Date,
          activities: [
            {
              id: 'act-3',
              title: destData.activities[0].title,
              time: destData.activities[0].time,
              location: destData.activities[0].location,
              isPinned: false,
              isEcoFriendly: destData.activities[0].isEcoFriendly,
            },
            {
              id: 'act-4',
              title: destData.activities[1].title,
              time: destData.activities[1].time,
              location: destData.activities[1].location,
              isPinned: true,
              isEcoFriendly: destData.activities[1].isEcoFriendly,
            },
          ],
        },
        {
          id: 'day-3',
          date: day3Date,
          activities: [
            {
              id: 'act-5',
              title: destData.activities[2].title,
              time: destData.activities[2].time,
              location: destData.activities[2].location,
              isPinned: false,
              isEcoFriendly: destData.activities[2].isEcoFriendly,
            },
            {
              id: 'act-6',
              title: 'Depart to Hong Kong',
              time: '18:00',
              location: destData.departureAirport,
              isPinned: true,
            },
          ],
        },
      ];
      
      setDayPlans(initialPlans);
    }
  }, [flightInfo, open, departureDate, returnDate]);

  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string>('');

  const handleTogglePin = (dayId: string, activityId: string) => {
    setDayPlans(prevDays => 
      prevDays.map(day => 
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.map(activity =>
                activity.id === activityId
                  ? { ...activity, isPinned: !activity.isPinned }
                  : activity
              )
            }
          : day
      )
    );
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    setDayPlans(prevDays =>
      prevDays.map(day =>
        day.id === dayId
          ? {
              ...day,
              activities: day.activities.filter(activity => activity.id !== activityId)
            }
          : day
      )
    );
  };

  const handleAddActivity = (dayId: string) => {
    setSelectedDayId(dayId);
    setShowAddActivityDialog(true);
  };

  const handleAddDay = () => {
    const newDayNumber = dayPlans.length + 1;
    const lastDate = new Date(dayPlans[dayPlans.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);
    
    const newDay: DayPlan = {
      id: `day-${newDayNumber}`,
      date: lastDate.toISOString().split('T')[0],
      activities: []
    };
    
    setDayPlans([...dayPlans, newDay]);
  };

  const handleActivityAdded = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
    };

    setDayPlans(prevDays =>
      prevDays.map(day =>
        day.id === selectedDayId
          ? {
              ...day,
              activities: [...day.activities, newActivity]
            }
          : day
      )
    );
  };

  const handleSaveItinerary = () => {
    if (!flightInfo) {
      toast.error('Flight information is missing');
      return;
    }

    try {
      // Get existing itineraries from localStorage
      const stored = localStorage.getItem('savedItineraries');
      const existingItineraries = stored ? JSON.parse(stored) : [];

      // Extract destination from arrival airport
      const destinationMatch = flightInfo.arrival.match(/^(.+?)\s*\(/);
      const destination = destinationMatch ? destinationMatch[1].trim() : flightInfo.arrival;

      // Get dates from day plans
      const departureDateStr = dayPlans.length > 0 ? dayPlans[0].date : new Date().toISOString().split('T')[0];
      const returnDateStr = dayPlans.length > 0 ? dayPlans[dayPlans.length - 1].date : undefined;

      // Format dates for display
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      // Create new itinerary object
      const newItinerary = {
        id: `itinerary-${Date.now()}`,
        destination: destination,
        flightNumber: flightInfo.flightNumber,
        departure: flightInfo.departure,
        arrival: flightInfo.arrival,
        departureDate: formatDate(departureDateStr),
        returnDate: returnDateStr ? formatDate(returnDateStr) : undefined,
        greenPoints: flightInfo.greenPoints,
        isEcoFriendly: flightInfo.greenPoints > 0,
        savedDate: new Date().toISOString(),
        dayPlans: dayPlans,
      };

      // Add to existing itineraries
      const updatedItineraries = [...existingItineraries, newItinerary];

      // Save to localStorage
      localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));

      // Update green points balance
      const currentBalance = localStorage.getItem('greenPointsBalance');
      const currentPoints = currentBalance ? parseInt(currentBalance) : 3000;
      const newBalance = currentPoints + flightInfo.greenPoints;
      localStorage.setItem('greenPointsBalance', newBalance.toString());

      // Update accumulated points
      const currentAccumulated = localStorage.getItem('greenPointsAccumulated');
      const accumulatedPoints = currentAccumulated ? parseInt(currentAccumulated) : 0;
      const newAccumulated = accumulatedPoints + flightInfo.greenPoints;
      localStorage.setItem('greenPointsAccumulated', newAccumulated.toString());

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('itinerariesUpdated'));
      window.dispatchEvent(new Event('greenPointsUpdated'));

      toast.success('Itinerary saved successfully!', {
        description: `+${flightInfo.greenPoints} GreenPoints earned! View your trip in the Itinerary page.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast.error('Failed to save itinerary');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="bg-primary text-primary-foreground p-6 pb-4">
            <DialogTitle className="tracking-wide">
              Plan Your Trip
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90">
              {flightInfo 
                ? `${flightInfo.flightNumber}: ${flightInfo.departure} → ${flightInfo.arrival}`
                : 'Create your perfect itinerary'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="itinerary" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="itinerary" className="m-0 overflow-auto max-h-[calc(90vh-180px)]">
              <ItineraryView
                dayPlans={dayPlans}
                onTogglePin={handleTogglePin}
                onDeleteActivity={handleDeleteActivity}
                onAddActivity={handleAddActivity}
                onAddDay={handleAddDay}
              />
            </TabsContent>

            <TabsContent value="map" className="m-0">
              <MapView dayPlans={dayPlans} />
            </TabsContent>
          </Tabs>

          <DialogFooter className="bg-primary text-primary-foreground p-6 pt-4">
            <Button onClick={handleSaveItinerary} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Itinerary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddActivityDialog
        open={showAddActivityDialog}
        onOpenChange={setShowAddActivityDialog}
        onAddActivity={handleActivityAdded}
      />
    </>
  );
}