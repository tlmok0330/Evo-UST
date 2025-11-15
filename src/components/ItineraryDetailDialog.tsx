import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  GripVertical, 
  Lock, 
  Edit2, 
  Trash2, 
  Plane, 
  MapPin, 
  Clock, 
  Leaf, 
  Sparkles,
  Hotel,
  Star,
  Flame,
  Heart
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SavedItinerary, Activity } from '../utils/itineraryStorage';
import { AddActivityDialog } from './AddActivityDialog';
import { HotelSelectorDialog } from './HotelSelectorDialog';
import { BookingDialog } from './BookingDialog';
import { getAIActivitySuggestions, saveAISuggestionsToSupabase } from '../utils/aiService';
import { getTrendingActivities } from '../utils/keywordService';
import { ScrollArea } from './ui/scroll-area';
import { EditActivityDialog } from './EditActivityDialog';
import { getUserInterests } from '../utils/userInterestsService';
import { BookingConfirmationDialog } from './BookingConfirmationDialog';
import { CancelBookingDialog } from './CancelBookingDialog';

interface ItineraryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itinerary: SavedItinerary | null;
  onUpdate?: () => void;
}

interface ActivityBlock extends Activity {
  type: 'activity';
  isFixed?: boolean;
  isAIRecommended?: boolean;
  dayIndex: number;
  partnerName?: string;
  description?: string;
  isUserAdded?: boolean; // Track if added by user
  isBooked?: boolean; // Track if the activity has been booked/paid
  matchingInterests?: string[]; // User interests that match this activity
}

interface FlightBlock {
  id: string;
  type: 'flight';
  title: string;
  time: string;
  location: string;
  isFixed: true;
  flightNumber?: string;
  dayIndex: number;
}

type Block = ActivityBlock | FlightBlock;

interface DayStructure {
  dayNumber: number;
  date: string;
  blocks: Block[];
}

export function ItineraryDetailDialog({ 
  open, 
  onOpenChange, 
  itinerary,
  onUpdate 
}: ItineraryDetailDialogProps) {
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
  const [selectedDayForAdd, setSelectedDayForAdd] = useState(0);
  const [dayStructures, setDayStructures] = useState<DayStructure[]>([]);
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());
  const [showHotelDialog, setShowHotelDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedActivityForBooking, setSelectedActivityForBooking] = useState<any>(null);
  const [showEditActivityDialog, setShowEditActivityDialog] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityBlock | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [confirmedActivity, setConfirmedActivity] = useState<any>(null);
  const [showCancelBookingDialog, setShowCancelBookingDialog] = useState(false);
  const [activityToCancel, setActivityToCancel] = useState<{ blockId: string; dayIndex: number; activity: ActivityBlock } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load trending keywords from Supabase
  useEffect(() => {
    const loadTrendingData = async () => {
      try {
        const trending = await getTrendingActivities(10);
        const keywords = trending.map(t => t.keyword);
        setTrendingKeywords(keywords);
        console.log('Loaded trending keywords:', keywords);
      } catch (error) {
        console.error('Error loading trending data:', error);
      }
    };
    
    if (open) {
      loadTrendingData();
    }
  }, [open]);

  // Load selected hotel from itinerary
  useEffect(() => {
    if (itinerary?.hotel) {
      setSelectedHotel(itinerary.hotel);
    }
  }, [itinerary]);

  // Calculate trip duration and generate day structures
  useEffect(() => {
    if (!itinerary) return;

    const departureDate = new Date(itinerary.departureDate);
    const returnDate = itinerary.returnDate ? new Date(itinerary.returnDate) : departureDate;
    
    // Calculate number of days
    const timeDiff = returnDate.getTime() - departureDate.getTime();
    const numDays = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1);

    // Generate day structures
    const days: DayStructure[] = [];
    
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(departureDate);
      currentDate.setDate(departureDate.getDate() + i);
      
      const blocks: Block[] = [];

      // Add departure flight on Day 1
      if (i === 0) {
        // Use flights array if available, otherwise fallback to old structure
        const outboundFlight = itinerary.flights?.find(f => f.type === 'outbound');
        
        blocks.push({
          id: `flight-departure`,
          type: 'flight',
          title: outboundFlight 
            ? `Flight ${outboundFlight.flightNumber} - Departure` 
            : `Flight ${itinerary.flightNumber} - Departure`,
          time: outboundFlight?.departureTime || '10:00',
          location: outboundFlight?.departure || itinerary.departure,
          isFixed: true,
          flightNumber: outboundFlight?.flightNumber || itinerary.flightNumber,
          dayIndex: i,
        });
      }

      // Add activities from saved day plans
      if (itinerary.dayPlans && itinerary.dayPlans[i]) {
        itinerary.dayPlans[i].activities.forEach((activity) => {
          blocks.push({
            ...activity,
            type: 'activity',
            isFixed: activity.isPinned,
            isAIRecommended: activity.isAIRecommended || false, // Preserve AI recommended flag
            dayIndex: i,
            isUserAdded: !activity.isAIRecommended, // Only mark as user-added if NOT AI recommended
          });
        });
      }

      // Add return flight on last day
      if (i === numDays - 1 && itinerary.returnDate) {
        // Use flights array if available, otherwise fallback to old structure
        const returnFlight = itinerary.flights?.find(f => f.type === 'return');
        
        blocks.push({
          id: `flight-return`,
          type: 'flight',
          title: returnFlight 
            ? `Flight ${returnFlight.flightNumber} - Return` 
            : `Flight ${itinerary.flightNumber} - Return`,
          time: returnFlight?.departureTime || '18:00',
          location: returnFlight?.departure || itinerary.arrival,
          isFixed: true,
          flightNumber: returnFlight?.flightNumber || itinerary.flightNumber,
          dayIndex: i,
        });
      }

      days.push({
        dayNumber: i + 1,
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        blocks: blocks.sort((a, b) => {
          // Sort blocks by time
          const timeA = a.time.replace(':', '');
          const timeB = b.time.replace(':', '');
          return timeA.localeCompare(timeB);
        }),
      });
    }

    setDayStructures(days);
  }, [itinerary]);

  const toggleDayCollapse = (dayNumber: number) => {
    const newCollapsed = new Set(collapsedDays);
    if (newCollapsed.has(dayNumber)) {
      newCollapsed.delete(dayNumber);
    } else {
      newCollapsed.add(dayNumber);
    }
    setCollapsedDays(newCollapsed);
  };

  const handleDeleteBlock = (blockId: string, dayIndex: number) => {
    const updatedDays = [...dayStructures];
    const day = updatedDays[dayIndex];
    
    const block = day.blocks.find(b => b.id === blockId);
    
    if (block?.type === 'flight' || (block as ActivityBlock)?.isFixed) {
      toast.error('Cannot delete fixed blocks');
      return;
    }

    // Check if the activity is booked
    if (block?.type === 'activity' && (block as ActivityBlock).isBooked) {
      // Show cancel booking confirmation dialog instead of deleting
      setActivityToCancel({ blockId, dayIndex, activity: block as ActivityBlock });
      setShowCancelBookingDialog(true);
      return;
    }

    day.blocks = day.blocks.filter(b => b.id !== blockId);
    setDayStructures(updatedDays);
    
    // Update localStorage
    if (itinerary) {
      saveToItinerary(updatedDays);
    }
    
    toast.success('Activity removed');
  };

  const handleAddActivity = (activity: Omit<Activity, 'id'>) => {
    const newBlock: ActivityBlock = {
      ...activity,
      id: `activity-${Date.now()}`,
      type: 'activity',
      isFixed: false,
      isAIRecommended: false,
      dayIndex: selectedDayForAdd,
      isUserAdded: true, // Mark as user-added
    };

    const updatedDays = [...dayStructures];
    updatedDays[selectedDayForAdd].blocks.push(newBlock);
    
    // Sort blocks by time
    updatedDays[selectedDayForAdd].blocks.sort((a, b) => {
      const timeA = a.time.replace(':', '');
      const timeB = b.time.replace(':', '');
      return timeA.localeCompare(timeB);
    });
    
    setDayStructures(updatedDays);
    
    // Update localStorage
    if (itinerary) {
      saveToItinerary(updatedDays);
    }
    
    toast.success(`Activity added to Day ${selectedDayForAdd + 1}`);
  };

  const handleAISuggestions = async (dayIndex: number) => {
    setIsLoadingAI(true);

    try {
      // Fetch user interests directly from localStorage (most reliable source)
      let userInterests: string[] = [];
      
      // Primary: localStorage
      const savedInterests = localStorage.getItem('userInterests');
      if (savedInterests) {
        try {
          userInterests = JSON.parse(savedInterests);
          console.log('✅ Loaded user interests from localStorage:', userInterests);
        } catch (e) {
          console.error('Failed to parse localStorage interests:', e);
        }
      }
      
      // Fallback: try to fetch from Supabase
      if (userInterests.length === 0) {
        const userEmail = 'sarah.chen@email.com';
        try {
          userInterests = await getUserInterests(userEmail);
          console.log('✅ Loaded user interests from Supabase:', userInterests);
          // Save to localStorage for next time
          if (userInterests.length > 0) {
            localStorage.setItem('userInterests', JSON.stringify(userInterests));
          }
        } catch (error) {
          console.log('⚠️ Could not load user interests from Supabase:', error);
        }
      }
      
      // If still no interests, log warning
      if (userInterests.length === 0) {
        console.warn('⚠️ WARNING: No user interests found! AI suggestions will not be personalized.');
        console.warn('Please set your interests in the Profile page.');
      } else {
        console.log('🎯 Will send these interests to AI:', userInterests);
      }

      // Show loading state
      toast.info('Getting AI suggestions...', {
        description: 'Finding exclusive partner experiences for you',
      });

      if (!itinerary) return;

      // Get existing activities for the current day
      const existingActivities = dayStructures[dayIndex].blocks
        .filter(b => b.type === 'activity')
        .map(b => ({
          title: b.title,
          time: b.time,
        }));

      // Get ALL activities across the entire trip to avoid duplicates
      const allActivitiesInTrip: Array<{ dayNumber: number; title: string }> = [];
      dayStructures.forEach((day, idx) => {
        day.blocks
          .filter(b => b.type === 'activity')
          .forEach(b => {
            allActivitiesInTrip.push({
              dayNumber: idx + 1,
              title: b.title,
            });
          });
      });

      // Determine flight constraints
      const isFirstDay = dayIndex === 0;
      const isLastDay = dayIndex === dayStructures.length - 1;
      const flightConstraints: {
        isFirstDay?: boolean;
        isLastDay?: boolean;
        departureTime?: string;
        returnTime?: string;
      } = {};

      if (isFirstDay) {
        const outboundFlight = itinerary.flights?.find(f => f.type === 'outbound');
        const departureTime = outboundFlight?.departureTime || '10:00';
        flightConstraints.isFirstDay = true;
        flightConstraints.departureTime = departureTime;
      }

      if (isLastDay && itinerary.returnDate) {
        const returnFlight = itinerary.flights?.find(f => f.type === 'return');
        const returnTime = returnFlight?.departureTime || '18:00';
        flightConstraints.isLastDay = true;
        flightConstraints.returnTime = returnTime;
      }

      // Call AI service with comprehensive context including user interests and flight constraints
      const suggestions = await getAIActivitySuggestions({
        destination: itinerary.destination,
        dayNumber: dayIndex + 1,
        totalDays: dayStructures.length,
        existingActivities,
        allActivitiesInTrip,
        preferences: ['eco-friendly', 'sustainable', 'local'],
        userInterests, // Pass user interests to AI
        flightConstraints, // Pass flight time constraints
      });

      console.log('User selected interests:', userInterests);
      console.log('AI suggestions before filtering:', suggestions);

      // Convert suggestions to ActivityBlocks
      const aiRecommendations: ActivityBlock[] = suggestions.map((suggestion, index) => {
        // CRITICAL: Filter matchingInterests to ONLY include interests that user actually selected
        const validMatchingInterests = (suggestion.matchingInterests || []).filter(interest => 
          userInterests.includes(interest)
        );
        
        console.log(`Activity "${suggestion.title}":`, {
          suggestedInterests: suggestion.matchingInterests,
          userInterests: userInterests,
          validInterests: validMatchingInterests
        });

        return {
          id: `ai-${Date.now()}-${index}`,
          type: 'activity',
          title: suggestion.title,
          time: suggestion.time,
          location: suggestion.location,
          isPinned: false,
          isEcoFriendly: suggestion.isEcoFriendly,
          isFixed: false,
          isAIRecommended: true,
          dayIndex: dayIndex,
          partnerName: suggestion.partnerName,
          description: suggestion.description,
          matchingInterests: validMatchingInterests, // Only include user-selected interests
        };
      });

      const updatedDays = [...dayStructures];
      updatedDays[dayIndex].blocks.push(...aiRecommendations);
      
      // Sort blocks by time
      updatedDays[dayIndex].blocks.sort((a, b) => {
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return timeA.localeCompare(timeB);
      });
      
      setDayStructures(updatedDays);
      
      if (itinerary) {
        saveToItinerary(updatedDays);
        // Save to Supabase when connected
        saveAISuggestionsToSupabase(itinerary.id, dayIndex + 1, suggestions);
      }

      toast.success('Partner events added!', {
        description: `${aiRecommendations.length} exclusive Cathay Pacific partner ${aiRecommendations.length === 1 ? 'experience' : 'experiences'} added to Day ${dayIndex + 1}`,
      });
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast.error('Could not load suggestions', {
        description: 'Please try again',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const saveToItinerary = (days: DayStructure[]) => {
    if (!itinerary) return;

    try {
      const stored = localStorage.getItem('savedItineraries');
      if (!stored) return;

      const itineraries: SavedItinerary[] = JSON.parse(stored);
      const itineraryIndex = itineraries.findIndex(it => it.id === itinerary.id);
      
      if (itineraryIndex === -1) return;

      // Convert day structures back to dayPlans format
      const dayPlans = days.map((day, index) => {
        const activityBlocks = day.blocks.filter(b => b.type === 'activity') as ActivityBlock[];
        
        return {
          id: `day-${index}`,
          date: day.date,
          activities: activityBlocks.map(b => ({
            id: b.id,
            title: b.title,
            time: b.time,
            location: b.location,
            isPinned: b.isPinned || false,
            isEcoFriendly: b.isEcoFriendly,
            partnerName: b.partnerName,
            description: b.description,
            isBooked: b.isBooked, // Save booked status
            matchingInterests: b.matchingInterests, // Save matching interests
            isAIRecommended: b.isAIRecommended, // Save AI recommended flag
          })),
        };
      });

      itineraries[itineraryIndex].dayPlans = dayPlans;

      localStorage.setItem('savedItineraries', JSON.stringify(itineraries));
      window.dispatchEvent(new Event('itinerariesUpdated'));
      onUpdate?.();
    } catch (error) {
      console.error('Error saving to itinerary:', error);
    }
  };

  const handleBookingConfirmed = (blockId: string, dayIndex: number) => {
    const updatedDays = [...dayStructures];
    const day = updatedDays[dayIndex];
    
    // Find the block and mark it as booked
    const blockIndex = day.blocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1 && day.blocks[blockIndex].type === 'activity') {
      (day.blocks[blockIndex] as ActivityBlock).isBooked = true;
      setDayStructures(updatedDays);
      
      // Update localStorage
      if (itinerary) {
        saveToItinerary(updatedDays);
      }
    }
  };

  const handleEditActivity = (activity: ActivityBlock) => {
    const isPartnerActivity = activity.isAIRecommended || activity.partnerName;
    const day = dayStructures[activity.dayIndex];
    
    if (isPartnerActivity) {
      // For partner activities
      if (activity.isBooked) {
        // If already booked, show booking confirmation
        setConfirmedActivity({
          title: activity.title,
          time: activity.time,
          location: activity.location,
          date: day.date,
          partnerName: activity.partnerName,
          description: activity.description,
          isEcoFriendly: activity.isEcoFriendly,
        });
        setShowBookingConfirmation(true);
      } else {
        // If not booked, show booking dialog
        setSelectedActivityForBooking({
          title: activity.title,
          time: activity.time,
          location: activity.location,
          description: activity.description,
          partnerName: activity.partnerName,
          isEcoFriendly: activity.isEcoFriendly,
          date: day.date,
          blockId: activity.id,
          dayIndex: activity.dayIndex,
        });
        setShowBookingDialog(true);
      }
    } else {
      // For regular activities, show edit dialog
      setActivityToEdit(activity);
      setShowEditActivityDialog(true);
    }
  };

  const handleUpdateActivity = (updatedActivity: ActivityBlock) => {
    const updatedDays = [...dayStructures];
    const day = updatedDays[updatedActivity.dayIndex];
    
    // Find the block and update it
    const blockIndex = day.blocks.findIndex(b => b.id === updatedActivity.id);
    if (blockIndex !== -1 && day.blocks[blockIndex].type === 'activity') {
      day.blocks[blockIndex] = updatedActivity;
      setDayStructures(updatedDays);
      
      // Update localStorage
      if (itinerary) {
        saveToItinerary(updatedDays);
      }
    }
    
    setShowEditActivityDialog(false);
    toast.success('Activity updated');
  };

  const handleCancelBooking = (blockId: string, dayIndex: number, activity: ActivityBlock) => {
    const updatedDays = [...dayStructures];
    const day = updatedDays[dayIndex];
    
    // Delete the block completely
    day.blocks = day.blocks.filter(b => b.id !== blockId);
    setDayStructures(updatedDays);
    
    // Update localStorage
    if (itinerary) {
      saveToItinerary(updatedDays);
    }
    
    setShowCancelBookingDialog(false);
    toast.success('Booking cancelled and activity removed');
  };

  if (!itinerary) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0">
          <DialogHeader className="bg-primary text-primary-foreground p-6">
            <DialogTitle className="tracking-wide">
              {itinerary.destination} Trip Details
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90">
              {dayStructures.length} {dayStructures.length === 1 ? 'Day' : 'Days'} • {itinerary.departureDate} {itinerary.returnDate && `- ${itinerary.returnDate}`}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-160px)]">
            <div className="p-6 space-y-4">
              {/* Trip Summary Card */}
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-green-50 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    <span className="text-sm">Flight {itinerary.flightNumber}</span>
                  </div>
                  {itinerary.isEcoFriendly && (
                    <Badge className="bg-green-600 text-white">
                      <Leaf className="h-3 w-3 mr-1" />
                      Eco-Friendly
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {itinerary.departure} → {itinerary.arrival}
                </div>
                {itinerary.greenPoints > 0 && (
                  <div className="mt-2 text-sm text-primary">
                    +{itinerary.greenPoints} Green Points earned
                  </div>
                )}
              </Card>

              {/* Hotel Selection Card */}
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-amber-700" />
                    <span className="text-sm">Accommodation</span>
                  </div>
                </div>
                
                {selectedHotel ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm">{selectedHotel.name}</h4>
                          {selectedHotel.isEcoFriendly && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <Leaf className="h-3 w-3 mr-1" />
                              Eco
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          {selectedHotel.location}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(selectedHotel.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {selectedHotel.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-primary">HK${selectedHotel.pricePerNight}</div>
                        <div className="text-xs text-muted-foreground">per night</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-700">
                        +{selectedHotel.greenPoints} GP per night
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowHotelDialog(true)}
                      >
                        Change Hotel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Choose your eco-friendly accommodation and earn more Green Points
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => setShowHotelDialog(true)}
                    >
                      <Hotel className="h-3 w-3 mr-2" />
                      Choose Hotel
                    </Button>
                  </div>
                )}
              </Card>

              {/* Day by Day Structure */}
              <div className="space-y-3">
                {dayStructures.map((day, dayIndex) => {
                  const isCollapsed = collapsedDays.has(day.dayNumber);
                  
                  return (
                    <Card key={day.dayNumber} className="overflow-hidden">
                      {/* Day Header */}
                      <div 
                        className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 cursor-pointer hover:from-primary/15 hover:to-primary/10 transition-colors"
                        onClick={() => toggleDayCollapse(day.dayNumber)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <span className="text-sm">{day.dayNumber}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3>Day {day.dayNumber}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {day.blocks.length} {day.blocks.length === 1 ? 'block' : 'blocks'}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{day.date}</div>
                            </div>
                          </div>
                          {isCollapsed ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Day Content */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-3">
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAISuggestions(dayIndex)}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                            >
                              <Sparkles className="h-3 w-3 mr-2" />
                              AI Suggestions
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedDayForAdd(dayIndex);
                                setShowAddActivityDialog(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Activity
                            </Button>
                          </div>

                          {/* Blocks for this day */}
                          <div className="space-y-2">
                            {day.blocks.map((block) => {
                              // Check if activity is trending
                              const isTrending = block.type === 'activity' && 
                                trendingKeywords.length > 0 && 
                                trendingKeywords.some(keyword => 
                                  block.title.toLowerCase().includes(keyword.toLowerCase())
                                );

                              const isUserAdded = block.type === 'activity' && (block as ActivityBlock).isUserAdded;
                              const isBooked = block.type === 'activity' && (block as ActivityBlock).isBooked;

                              return (
                                <Card
                                  key={block.id}
                                  className={`p-3 transition-all hover:shadow-md ${
                                    isBooked
                                      ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500'
                                      : isTrending
                                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 shadow-red-200 shadow-md cursor-pointer hover:border-red-500'
                                      : block.type === 'flight'
                                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30'
                                      : (block as ActivityBlock).isAIRecommended
                                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 cursor-pointer hover:border-purple-400'
                                      : isUserAdded
                                      ? 'bg-white border cursor-pointer hover:border-gray-300'
                                      : 'bg-white border cursor-pointer hover:border-primary/40'
                                  }`}
                                  onClick={() => {
                                    // Only open booking dialog for non-user-added activities
                                    if (block.type === 'activity' && !isUserAdded && !isBooked) {
                                      setSelectedActivityForBooking({
                                        title: block.title,
                                        time: block.time,
                                        location: block.location,
                                        description: (block as ActivityBlock).description,
                                        partnerName: (block as ActivityBlock).partnerName,
                                        isEcoFriendly: (block as ActivityBlock).isEcoFriendly,
                                        date: day.date,
                                        blockId: block.id,
                                        dayIndex: dayIndex,
                                      });
                                      setShowBookingDialog(true);
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Drag Handle / Lock Icon */}
                                    <div className="mt-1">
                                      {block.type === 'flight' || (block as ActivityBlock).isFixed ? (
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-sm">
                                              {block.title}
                                            </span>
                                            {block.type === 'flight' && (
                                              <Badge variant="secondary" className="text-xs">
                                                Flight
                                              </Badge>
                                            )}
                                            {isTrending && (
                                              <Badge className="text-xs bg-red-100 text-red-700 border-red-300 animate-pulse">
                                                <Flame className="h-3 w-3 mr-1" />
                                                Trending
                                              </Badge>
                                            )}
                                            {(block as ActivityBlock).isAIRecommended && (
                                              <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                Partner Event
                                              </Badge>
                                            )}
                                            {(block as ActivityBlock).isEcoFriendly && (
                                              <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                                                <Leaf className="h-3 w-3 mr-1" />
                                                Eco
                                              </Badge>
                                            )}
                                            {/* Show matching interests badge */}
                                            {(block as ActivityBlock).matchingInterests && (block as ActivityBlock).matchingInterests!.length > 0 && (
                                              <Badge className="text-xs bg-pink-100 text-pink-700 border-pink-300">
                                                <Heart className="h-3 w-3 mr-1" />
                                                {(block as ActivityBlock).matchingInterests![0]}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {block.time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MapPin className="h-3 w-3" />
                                              {block.location}
                                            </div>
                                          </div>
                                          
                                          {/* Show partner info and description for AI recommended activities */}
                                          {(block as ActivityBlock).isAIRecommended && (
                                            <div className="mt-2 space-y-1">
                                              {(block as ActivityBlock).partnerName && (
                                                <div className="text-xs text-purple-700 flex items-center gap-1">
                                                  <Star className="h-3 w-3" />
                                                  <span className="italic">By {(block as ActivityBlock).partnerName}</span>
                                                </div>
                                              )}
                                              {(block as ActivityBlock).description && (
                                                <div className="text-xs text-muted-foreground">
                                                  {(block as ActivityBlock).description}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                          {block.type !== 'flight' && !(block as ActivityBlock).isFixed && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditActivity(block as ActivityBlock);
                                                }}
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteBlock(block.id, dayIndex);
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}

                            {day.blocks.length === 0 && (
                              <div className="text-center py-6 text-muted-foreground text-sm bg-gray-50 rounded-lg">
                                No activities planned yet. Add some or get AI suggestions!
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AddActivityDialog
        open={showAddActivityDialog}
        onOpenChange={setShowAddActivityDialog}
        onAddActivity={handleAddActivity}
        dayNumber={selectedDayForAdd + 1}
      />

      <HotelSelectorDialog
        open={showHotelDialog}
        onOpenChange={setShowHotelDialog}
        destination={itinerary.destination}
        onSelectHotel={(hotel) => {
          setSelectedHotel(hotel);
          // Save hotel to localStorage
          if (itinerary) {
            try {
              const stored = localStorage.getItem('savedItineraries');
              if (stored) {
                const itineraries: SavedItinerary[] = JSON.parse(stored);
                const itineraryIndex = itineraries.findIndex(it => it.id === itinerary.id);
                
                if (itineraryIndex !== -1) {
                  itineraries[itineraryIndex].hotel = hotel;
                  localStorage.setItem('savedItineraries', JSON.stringify(itineraries));
                  window.dispatchEvent(new Event('itinerariesUpdated'));
                  onUpdate?.();
                }
              }
            } catch (error) {
              console.error('Error saving hotel:', error);
            }
          }
        }}
        selectedHotel={selectedHotel}
      />

      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        activity={selectedActivityForBooking}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* Separate confirmation dialog for viewing booked activities */}
      <BookingConfirmationDialog
        open={showBookingConfirmation}
        onOpenChange={setShowBookingConfirmation}
        activity={confirmedActivity}
      />

      <EditActivityDialog
        open={showEditActivityDialog}
        onOpenChange={setShowEditActivityDialog}
        activity={activityToEdit}
        onSave={handleUpdateActivity}
      />

      <CancelBookingDialog
        open={showCancelBookingDialog}
        onOpenChange={setShowCancelBookingDialog}
        activity={activityToCancel}
        onCancelBooking={handleCancelBooking}
      />
    </>
  );
}