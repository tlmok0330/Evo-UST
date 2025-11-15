import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  Hotel, 
  Leaf, 
  Star, 
  Wifi,
  Coffee,
  Dumbbell,
  UtensilsCrossed,
  MapPin,
  Check,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface HotelOption {
  id: string;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  isEcoFriendly: boolean;
  greenPoints: number;
  amenities: string[];
  image: string;
  description: string;
}

interface HotelSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  onSelectHotel: (hotel: HotelOption) => void;
  selectedHotel?: HotelOption | null;
}

export function HotelSelectorDialog({ 
  open, 
  onOpenChange, 
  destination,
  onSelectHotel,
  selectedHotel 
}: HotelSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate sample hotels based on destination
  const hotels: HotelOption[] = [
    {
      id: 'hotel-1',
      name: `Green Haven Hotel ${destination}`,
      location: `Central ${destination}`,
      rating: 4.8,
      pricePerNight: 1200,
      isEcoFriendly: true,
      greenPoints: 45,
      amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Restaurant', 'Solar Powered'],
      image: 'eco-hotel',
      description: 'Certified eco-friendly hotel with sustainable practices'
    },
    {
      id: 'hotel-2',
      name: `${destination} Eco Lodge`,
      location: `Downtown ${destination}`,
      rating: 4.6,
      pricePerNight: 980,
      isEcoFriendly: true,
      greenPoints: 35,
      amenities: ['Free WiFi', 'Breakfast', 'Organic Restaurant', 'Zero Waste'],
      image: 'eco-lodge',
      description: 'Boutique hotel committed to environmental sustainability'
    },
    {
      id: 'hotel-3',
      name: `Sustainable Suites ${destination}`,
      location: `${destination} Bay Area`,
      rating: 4.7,
      pricePerNight: 1450,
      isEcoFriendly: true,
      greenPoints: 50,
      amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Pool', 'Restaurant', 'EV Charging'],
      image: 'sustainable-hotel',
      description: 'Luxury accommodation with green building certification'
    },
    {
      id: 'hotel-4',
      name: `${destination} Grand Hotel`,
      location: `City Center ${destination}`,
      rating: 4.5,
      pricePerNight: 1100,
      isEcoFriendly: false,
      greenPoints: 15,
      amenities: ['Free WiFi', 'Breakfast', 'Gym', 'Restaurant'],
      image: 'standard-hotel',
      description: 'Classic hotel with modern amenities'
    },
    {
      id: 'hotel-5',
      name: `${destination} Business Hotel`,
      location: `Business District ${destination}`,
      rating: 4.3,
      pricePerNight: 850,
      isEcoFriendly: false,
      greenPoints: 10,
      amenities: ['Free WiFi', 'Breakfast', 'Business Center'],
      image: 'business-hotel',
      description: 'Convenient location for business travelers'
    }
  ];

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('wifi')) return <Wifi className="h-3 w-3" />;
    if (amenity.toLowerCase().includes('breakfast') || amenity.toLowerCase().includes('restaurant')) return <UtensilsCrossed className="h-3 w-3" />;
    if (amenity.toLowerCase().includes('gym')) return <Dumbbell className="h-3 w-3" />;
    if (amenity.toLowerCase().includes('coffee')) return <Coffee className="h-3 w-3" />;
    return <Check className="h-3 w-3" />;
  };

  const handleSelectHotel = (hotel: HotelOption) => {
    onSelectHotel(hotel);
    toast.success('Hotel selected!', {
      description: `${hotel.name} - +${hotel.greenPoints} GP`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="bg-primary text-primary-foreground p-6">
          <DialogTitle className="tracking-wide flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Choose Your Hotel in {destination}
          </DialogTitle>
          <DialogDescription className="text-sm opacity-90 mt-1 text-primary-foreground/90">
            Earn Green Points by choosing eco-friendly accommodations
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <Leaf className="h-3 w-3 mr-1" />
              Eco-Friendly First
            </Badge>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredHotels.map((hotel) => (
                <Card
                  key={hotel.id}
                  className={`p-4 transition-all hover:shadow-lg cursor-pointer ${
                    hotel.isEcoFriendly
                      ? 'border-2 border-green-500/50 bg-green-50/30'
                      : 'border-border hover:border-primary/50'
                  } ${
                    selectedHotel?.id === hotel.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleSelectHotel(hotel)}
                >
                  <div className="flex gap-4">
                    {/* Hotel Image Placeholder */}
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Hotel className="h-12 w-12 text-primary/60" />
                    </div>

                    {/* Hotel Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm line-clamp-1">{hotel.name}</h3>
                            {hotel.isEcoFriendly && (
                              <Badge className="bg-green-600 text-white text-xs">
                                <Leaf className="h-3 w-3 mr-1" />
                                Eco
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            {hotel.location}
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(hotel.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {hotel.rating}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-primary">HK${hotel.pricePerNight}</div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {hotel.description}
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hotel.amenities.slice(0, 5).map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Green Points */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <Leaf className="h-3 w-3 text-green-600" />
                          <span className="text-green-700">
                            Earn +{hotel.greenPoints} GP per night
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className={hotel.isEcoFriendly ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectHotel(hotel);
                          }}
                        >
                          {selectedHotel?.id === hotel.id ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredHotels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hotels found matching your search</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}