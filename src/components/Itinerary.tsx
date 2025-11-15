import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Clock, Leaf, Plane, Trash2, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ItineraryDetailDialog } from './ItineraryDetailDialog';

export interface SavedItinerary {
  id: string;
  destination: string;
  tripType?: string;
  flights?: Array<{
    type: string;
    flightNumber: string;
    airline: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    date: string;
    carbonSaved: number;
    greenPoints: number;
    isEcoFriendly: boolean;
  }>;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  greenPoints: number;
  isEcoFriendly: boolean;
  savedDate: Date;
  hotel?: {
    id: string;
    name: string;
    location: string;
    rating: number;
    pricePerNight: number;
    isEcoFriendly: boolean;
    greenPoints: number;
    amenities: string[];
  };
  dayPlans?: {
    id: string;
    date: string;
    activities: {
      id: string;
      title: string;
      time: string;
      location: string;
      isPinned: boolean;
      isEcoFriendly?: boolean;
      partnerName?: string;
      description?: string;
      isBooked?: boolean;
      matchingInterests?: string[];
      isAIRecommended?: boolean;
    }[];
  }[];
}

export function Itinerary() {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Load saved itineraries from localStorage on mount and when component becomes visible
  useEffect(() => {
    const loadItineraries = () => {
      try {
        const stored = localStorage.getItem('savedItineraries');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert savedDate strings back to Date objects
          const itineraries = parsed.map((item: any) => ({
            ...item,
            savedDate: new Date(item.savedDate),
          }));
          setSavedItineraries(itineraries);
        }
      } catch (error) {
        console.error('Error loading itineraries:', error);
      }
    };
    
    loadItineraries();

    // Listen for storage events to reload when data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedItineraries') {
        loadItineraries();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for a custom event for same-window updates
    const handleCustomEvent = () => {
      loadItineraries();
    };
    window.addEventListener('itinerariesUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('itinerariesUpdated', handleCustomEvent);
    };
  }, []);

  const handleDeleteItinerary = (id: string) => {
    const updatedItineraries = savedItineraries.filter(itinerary => itinerary.id !== id);
    setSavedItineraries(updatedItineraries);
    localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));
    toast.success('Itinerary deleted', {
      description: 'Your saved itinerary has been removed.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="tracking-wide">My Itineraries</h1>
            <div className="text-xs opacity-90 mt-1">Your saved travel plans</div>
          </div>
          <div className="text-xs opacity-90 uppercase tracking-wider">Cathay</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {savedItineraries.length === 0 ? (
          // Empty State
          <Card className="shadow-md border-dashed">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-primary mb-2">No Saved Itineraries</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start planning your eco-friendly trip in the Holiday page
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Saved Itineraries List
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {savedItineraries.length} saved {savedItineraries.length === 1 ? 'itinerary' : 'itineraries'}
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <Leaf className="h-3 w-3 mr-1" />
                Eco-Friendly Travel
              </Badge>
            </div>

            {savedItineraries.map((itinerary) => (
              <Card 
                key={itinerary.id} 
                className={`shadow-md transition-all hover:shadow-lg ${
                  itinerary.isEcoFriendly 
                    ? 'border-2 border-green-500/50 bg-green-50/30' 
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="text-primary">{itinerary.destination}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Flight {itinerary.flightNumber}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItinerary(itinerary.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Flight Route */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">From</div>
                      <div className="text-sm">{itinerary.departure}</div>
                    </div>
                    <Plane className="h-4 w-4 text-primary rotate-90" />
                    <div className="flex-1 text-right">
                      <div className="text-xs text-muted-foreground mb-1">To</div>
                      <div className="text-sm">{itinerary.arrival}</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Departure</div>
                        <div className="text-sm">{itinerary.departureDate}</div>
                      </div>
                    </div>
                    {itinerary.returnDate && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-xs text-muted-foreground">Return</div>
                          <div className="text-sm">{itinerary.returnDate}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Green Points */}
                  {itinerary.isEcoFriendly && (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg mb-3">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary">Eco-Friendly Flight</span>
                      </div>
                      <div className="text-sm text-primary">+{itinerary.greenPoints} GP</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedItinerary(itinerary);
                        setShowDetailDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Saved Date */}
                  <div className="text-xs text-muted-foreground text-center mt-3">
                    Saved on {itinerary.savedDate.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <ItineraryDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        itinerary={selectedItinerary}
        onUpdate={() => {
          // Reload itineraries when updates are made
          const stored = localStorage.getItem('savedItineraries');
          if (stored) {
            const parsed = JSON.parse(stored);
            const itineraries = parsed.map((item: any) => ({
              ...item,
              savedDate: new Date(item.savedDate),
            }));
            setSavedItineraries(itineraries);
          }
        }}
      />
    </div>
  );
}