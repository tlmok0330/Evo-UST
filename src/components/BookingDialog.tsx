import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CreditCard, 
  Star, 
  Leaf,
  Sparkles,
  Check,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    title: string;
    time: string;
    location: string;
    description?: string;
    partnerName?: string;
    isEcoFriendly?: boolean;
    date?: string;
    blockId?: string;
    dayIndex?: number;
  } | null;
  onBookingConfirmed?: (blockId: string, dayIndex: number) => void;
}

export function BookingDialog({ open, onOpenChange, activity, onBookingConfirmed }: BookingDialogProps) {
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  if (!activity) return null;

  // Calculate pricing based on activity type and content (in HKD)
  const calculateActivityPrice = (): number => {
    const titleLower = activity.title.toLowerCase();
    const descLower = (activity.description || '').toLowerCase();
    const combined = titleLower + ' ' + descLower;
    
    // Premium experiences (HKD 800-1500)
    if (combined.includes('spa') || combined.includes('wellness') || combined.includes('luxury') || 
        combined.includes('yacht') || combined.includes('helicopter') || combined.includes('private')) {
      return activity.isEcoFriendly ? 900 : 1200;
    }
    
    // Adventure/sports (HKD 600-1000)
    if (combined.includes('diving') || combined.includes('surfing') || combined.includes('kayak') || 
        combined.includes('climbing') || combined.includes('rafting') || combined.includes('zipline') ||
        combined.includes('adventure')) {
      return activity.isEcoFriendly ? 650 : 850;
    }
    
    // Food & dining experiences (HKD 400-700)
    if (combined.includes('food') || combined.includes('dining') || combined.includes('restaurant') || 
        combined.includes('culinary') || combined.includes('cooking') || combined.includes('tasting') ||
        combined.includes('market tour') || combined.includes('chef')) {
      return activity.isEcoFriendly ? 450 : 600;
    }
    
    // Boat/cruise experiences (HKD 500-900)
    if (combined.includes('cruise') || combined.includes('boat') || combined.includes('sailing') || 
        combined.includes('ferry') || combined.includes('harbor')) {
      return activity.isEcoFriendly ? 550 : 750;
    }
    
    // Workshops/classes (HKD 400-800)
    if (combined.includes('workshop') || combined.includes('class') || combined.includes('lesson') || 
        combined.includes('pottery') || combined.includes('craft') || combined.includes('art')) {
      return activity.isEcoFriendly ? 450 : 650;
    }
    
    // Outdoor activities/hiking (HKD 300-500)
    if (combined.includes('hike') || combined.includes('hiking') || combined.includes('trek') || 
        combined.includes('mountain') || combined.includes('trail') || combined.includes('nature walk')) {
      return activity.isEcoFriendly ? 320 : 450;
    }
    
    // Museums/cultural sites (HKD 200-400)
    if (combined.includes('museum') || combined.includes('temple') || combined.includes('historic') || 
        combined.includes('heritage') || combined.includes('gallery') || combined.includes('monument')) {
      return activity.isEcoFriendly ? 220 : 350;
    }
    
    // Tours (HKD 350-600)
    if (combined.includes('tour') || combined.includes('sightseeing') || combined.includes('city walk') ||
        combined.includes('guided')) {
      return activity.isEcoFriendly ? 380 : 520;
    }
    
    // Default/general activities (HKD 300-500)
    return activity.isEcoFriendly ? 350 : 480;
  };

  const basePrice = calculateActivityPrice();
  const totalPrice = basePrice * guests;
  const greenPointsEarned = activity.isEcoFriendly ? 50 * guests : 25 * guests;

  const handleBooking = () => {
    setIsBooking(true);
    
    // Simulate booking API call
    setTimeout(() => {
      setIsBooking(false);
      onOpenChange(false);
      
      // Mark activity as booked
      if (activity.blockId && activity.dayIndex !== undefined && onBookingConfirmed) {
        onBookingConfirmed(activity.blockId, activity.dayIndex);
      }
      
      toast.success('Booking Confirmed!', {
        description: `You've booked ${activity.title} for ${guests} guest${guests > 1 ? 's' : ''}. You'll earn ${greenPointsEarned} GP!`,
      });
    }, 1500);
  };

  const incrementGuests = () => {
    if (guests < 10) setGuests(guests + 1);
  };

  const decrementGuests = () => {
    if (guests > 1) setGuests(guests - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{activity.title}</DialogTitle>
              <DialogDescription className="sr-only">
                Book this partner event experience
              </DialogDescription>
              {activity.partnerName && (
                <div className="flex items-center gap-2 text-sm text-purple-700 mb-2">
                  <Star className="h-4 w-4" />
                  <span className="italic">By {activity.partnerName}</span>
                </div>
              )}
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              Partner Event
            </Badge>
          </div>
          <DialogDescription className="text-left">
            {activity.description || 'Book this exclusive Cathay Pacific partner experience'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Event Details */}
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Event Details
            </h3>
            <div className="space-y-2">
              {activity.date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{activity.date}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{activity.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{activity.location}</span>
              </div>
              {activity.isEcoFriendly && (
                <div className="flex items-center gap-2 text-sm">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">Sustainable Experience</span>
                </div>
              )}
            </div>
          </Card>

          {/* Guest Selection */}
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Number of Guests
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Select guests</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementGuests}
                  disabled={guests <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">{guests}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementGuests}
                  disabled={guests >= 10}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Pricing Summary */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-white border-primary/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Pricing Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price per person</span>
                <span className="font-medium">HK${basePrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">× {guests}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">HK${totalPrice}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Green Points Reward */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">Earn Green Points</p>
                  <p className="text-xs text-green-700">Sustainable travel rewards</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">+{greenPointsEarned}</p>
                <p className="text-xs text-green-700">GP</p>
              </div>
            </div>
          </Card>

          {/* Booking Button */}
          <Button
            onClick={handleBooking}
            disabled={isBooking}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white py-6"
            size="lg"
          >
            {isBooking ? (
              <>
                <span className="animate-pulse">Processing Booking...</span>
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Confirm Booking - HK${totalPrice}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By booking, you agree to the partner's terms and conditions
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}