import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Plane, Calendar, Clock, MapPin, Leaf, Award, Crown, Gem, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { PreFlightDialog } from './PreFlightDialog';
import { toast } from 'sonner';
import React from 'react';

// Tier system configuration
const TIERS = [
  { 
    name: 'Bronze', 
    minPoints: 0, 
    maxPoints: 2999, 
    icon: Award,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/20 to-amber-600/10',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    borderColor: 'border-amber-400',
    bgColor: 'bg-gradient-to-br from-amber-50/50 to-amber-100/30',
    textColor: 'text-amber-600'
  },
  { 
    name: 'Silver', 
    minPoints: 3000, 
    maxPoints: 9999, 
    icon: Star,
    color: 'text-gray-600',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
    badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gradient-to-br from-gray-50/50 to-gray-100/30',
    textColor: 'text-gray-600'
  },
  { 
    name: 'Gold', 
    minPoints: 10000, 
    maxPoints: 24999, 
    icon: Crown,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-400/20 to-yellow-500/10',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-gradient-to-br from-yellow-50/50 to-yellow-100/30',
    textColor: 'text-yellow-600'
  },
  { 
    name: 'Diamond', 
    minPoints: 25000, 
    maxPoints: Infinity, 
    icon: Gem,
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-400/20 to-cyan-500/10',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    borderColor: 'border-cyan-400',
    bgColor: 'bg-gradient-to-br from-cyan-50/50 to-cyan-100/30',
    textColor: 'text-cyan-600'
  }
];

const getTierInfo = (points: number) => {
  const currentTier = TIERS.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || TIERS[0];
  const currentTierIndex = TIERS.indexOf(currentTier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  
  // Calculate progress to next tier
  const progressInCurrentTier = points - currentTier.minPoints;
  const pointsNeededForNextTier = nextTier ? (nextTier.minPoints - currentTier.minPoints) : 1;
  const progress = nextTier ? (progressInCurrentTier / pointsNeededForNextTier) * 100 : 100;
  
  return {
    currentTier,
    nextTier,
    progress: Math.min(progress, 100),
    pointsToNextTier: nextTier ? nextTier.minPoints - points : 0,
  };
};

interface DashboardProps {
  onNavigate?: (page: 'dashboard' | 'holiday' | 'itinerary' | 'rewards' | 'community' | 'profile') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [greenPoints, setGreenPoints] = useState(() => {
    const saved = localStorage.getItem('greenPointsBalance');
    return saved ? parseInt(saved) : 12467;
  });
  
  const [accumulatedPoints, setAccumulatedPoints] = useState(() => {
    const saved = localStorage.getItem('greenPointsAccumulated');
    return saved ? parseInt(saved) : 12467; // Gold tier status
  });
  
  const [co2Saved, setCo2Saved] = useState(() => {
    const saved = localStorage.getItem('totalCO2Saved');
    return saved ? parseFloat(saved) : 12.0;
  });
  
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem('userName');
    return saved || 'Sarah';
  });
  
  const [nextFlight, setNextFlight] = useState<any>(null);
  
  const [isPreFlightDialogOpen, setIsPreFlightDialogOpen] = useState(false);
  const tierInfo = getTierInfo(accumulatedPoints); // Use accumulated points for tier

  // Load next flight from saved itineraries
  useEffect(() => {
    const loadNextFlight = () => {
      const stored = localStorage.getItem('savedItineraries');
      if (stored) {
        const itineraries = JSON.parse(stored);
        // Get the most recent itinerary
        if (itineraries.length > 0) {
          const latest = itineraries[itineraries.length - 1];
          setNextFlight(latest);
        }
      }
    };
    
    loadNextFlight();
    
    // Listen for new itineraries
    window.addEventListener('itinerariesUpdated', loadNextFlight);
    return () => window.removeEventListener('itinerariesUpdated', loadNextFlight);
  }, []);

  // Listen for green points updates from other components
  useEffect(() => {
    const handleGreenPointsUpdate = () => {
      const savedBalance = localStorage.getItem('greenPointsBalance');
      const savedAccumulated = localStorage.getItem('greenPointsAccumulated');
      const savedCO2 = localStorage.getItem('totalCO2Saved');
      
      if (savedBalance) {
        setGreenPoints(parseInt(savedBalance));
      }
      if (savedAccumulated) {
        setAccumulatedPoints(parseInt(savedAccumulated));
      }
      if (savedCO2) {
        setCo2Saved(parseFloat(savedCO2));
      }
      
      console.log('=== Dashboard Updated ===');
      console.log('Green Points Balance:', savedBalance);
      console.log('Accumulated Points:', savedAccumulated);
      console.log('CO2 Saved:', savedCO2);
      console.log('========================');
    };

    window.addEventListener('greenPointsUpdated', handleGreenPointsUpdate);
    return () => window.removeEventListener('greenPointsUpdated', handleGreenPointsUpdate);
  }, []);

  // Listen for username updates from Profile
  useEffect(() => {
    const handleUserNameUpdate = () => {
      const savedName = localStorage.getItem('userName');
      if (savedName) {
        setUserName(savedName);
      }
    };

    window.addEventListener('storage', handleUserNameUpdate);
    window.addEventListener('userNameUpdated', handleUserNameUpdate);
    return () => {
      window.removeEventListener('storage', handleUserNameUpdate);
      window.removeEventListener('userNameUpdated', handleUserNameUpdate);
    };
  }, []);

  const handleEarnPoints = (points: number) => {
    const newBalance = greenPoints + points;
    const newAccumulated = accumulatedPoints + points;
    
    setGreenPoints(newBalance);
    setAccumulatedPoints(newAccumulated);
    
    localStorage.setItem('greenPointsBalance', newBalance.toString());
    localStorage.setItem('greenPointsAccumulated', newAccumulated.toString());
    
    window.dispatchEvent(new Event('greenPointsUpdated'));
    
    toast.success(`You earned ${points} GreenPoints!`, {
      description: 'Your sustainable choices make a difference.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="tracking-wide">Welcome back, {userName}</h1>
            <div className="text-xs opacity-90 mt-1">Marco Polo Club Member</div>
          </div>
          <div className="text-xs opacity-90 uppercase tracking-wider">Cathay</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="text-center py-4">
          <h2 className="text-primary">Your Green Journey</h2>
        </div>

        {/* Flight Information Card */}
        <Card className="shadow-md border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Next Flight
              </CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {nextFlight ? 'Confirmed' : 'No Booking'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextFlight ? (
              <>
                {/* Flight Number */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Flight</div>
                  <div className="text-xl">{nextFlight.flightNumber}</div>
                </div>

                {/* Route */}
                <div className="flex items-center justify-between py-3 border-y border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div>{nextFlight.departure.split('(')[0].trim()}</div>
                    <div className="text-xs text-muted-foreground">
                      {nextFlight.departure.match(/\(([^)]+)\)/)?.[1] || 'HKG'}
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="w-16 h-px bg-primary relative">
                      <Plane className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">To</div>
                    <div>{nextFlight.destination}</div>
                    <div className="text-xs text-muted-foreground">
                      {nextFlight.arrival.match(/\(([^)]+)\)/)?.[1] || ''}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </div>
                    <div>{nextFlight.departureDate}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {nextFlight.returnDate ? 'Return' : 'Departure'}
                    </div>
                    <div>{nextFlight.returnDate || nextFlight.departureDate}</div>
                  </div>
                </div>

                {/* Eco Badge */}
                {nextFlight.isEcoFriendly && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Leaf className="h-4 w-4" />
                      <div className="text-sm">
                        Eco-Friendly Flight • +{nextFlight.greenPoints} GP earned
                      </div>
                    </div>
                  </div>
                )}

                {/* Earn Points Button */}
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => setIsPreFlightDialogOpen(true)}
                >
                  <Leaf className="mr-2 h-4 w-4" />
                  Earn More Green Points
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No upcoming flights booked</p>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('holiday');
                      toast.success('Let\'s find your next eco-friendly flight!');
                    } else {
                      toast.info('Visit the Holiday page to book your next eco-friendly flight!');
                    }
                  }}
                >
                  Book a Flight
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Green Points Progress */}
        <Card className={`shadow-md ${tierInfo.currentTier.borderColor} border-2 ${tierInfo.currentTier.bgColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Green Points Balance
              </CardTitle>
              <Badge className={tierInfo.currentTier.badgeColor}>
                {React.createElement(tierInfo.currentTier.icon, { className: 'h-3.5 w-3.5 mr-1 inline' })}
                {tierInfo.currentTier.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tier Progress Section */}
            <div className="bg-white/50 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(tierInfo.currentTier.icon, { 
                    className: `h-8 w-8 ${tierInfo.currentTier.textColor}` 
                  })}
                  <div>
                    <div className={`${tierInfo.currentTier.textColor}`}>{tierInfo.currentTier.name} Member</div>
                    <div className="text-xs text-muted-foreground">
                      {tierInfo.nextTier 
                        ? `${tierInfo.pointsToNextTier} GP to ${tierInfo.nextTier.name}` 
                        : 'Highest Tier Achieved!'}
                    </div>
                  </div>
                </div>
                {tierInfo.nextTier && (
                  <div className="flex items-center gap-2 opacity-50">
                    {React.createElement(tierInfo.nextTier.icon, { 
                      className: `h-6 w-6 ${tierInfo.nextTier.textColor}` 
                    })}
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={tierInfo.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tierInfo.currentTier.minPoints} GP</span>
                  {tierInfo.nextTier && <span>{tierInfo.nextTier.minPoints} GP</span>}
                </div>
              </div>
            </div>

            {/* Points Display */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Your Balance</div>
                <div className="text-3xl text-primary">{greenPoints} GP</div>
              </div>
              {tierInfo.nextTier && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Next Tier</div>
                  <div className="text-xl">{tierInfo.nextTier.minPoints} GP</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-primary/10">
              <div className="text-sm text-muted-foreground">
                Keep traveling sustainably to earn more points and unlock exclusive rewards!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-primary mb-1">3</div>
              <div className="text-xs text-muted-foreground">Trips Completed</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-primary mb-1">{accumulatedPoints.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-primary mb-1">
                {co2Saved.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">CO₂ Saved (kg)</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pre-Flight Preferences Dialog */}
      <PreFlightDialog
        open={isPreFlightDialogOpen}
        onOpenChange={setIsPreFlightDialogOpen}
        onConfirm={handleEarnPoints}
      />
    </div>
  );
}