import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Gift, Star, Plane, Wifi, Coffee, Sparkles, MapPin, Crown, Lock, Ticket, Calendar, Copy, Check } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { QRCodeDialog } from './QRCodeDialog';

interface RedeemedCoupon {
  name: string;
  points: number;
  iconName: string; // Store icon name as string instead of component
  description: string;
  redeemedDate: Date;
  expiryDate: Date;
  promoCode?: string; // Optional promo code for flight booking
}

// Icon mapping to convert string names back to components
const iconMap: Record<string, any> = {
  Trophy,
  Gift,
  Star,
  Plane,
  Wifi,
  Coffee,
  Sparkles,
  MapPin,
  Crown,
};

export function Rewards() {
  // Load initial state from localStorage
  const [greenPointsBalance, setGreenPointsBalance] = useState(() => {
    const saved = localStorage.getItem('greenPointsBalance');
    return saved ? parseInt(saved) : 3000;
  });
  
  const [redeemedCoupons, setRedeemedCoupons] = useState<RedeemedCoupon[]>(() => {
    const saved = localStorage.getItem('redeemedCoupons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate and convert date strings back to Date objects
        const validCoupons = parsed
          .filter((coupon: any) => {
            // Filter out invalid coupons (from old format)
            return coupon.iconName && typeof coupon.iconName === 'string' && iconMap[coupon.iconName];
          })
          .map((coupon: any) => ({
            ...coupon,
            redeemedDate: new Date(coupon.redeemedDate),
            expiryDate: new Date(coupon.expiryDate),
          }));
        return validCoupons;
      } catch {
        // If there's an error parsing, clear localStorage and start fresh
        localStorage.removeItem('redeemedCoupons');
        return [];
      }
    }
    return [];
  });

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<RedeemedCoupon | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('greenPointsBalance', greenPointsBalance.toString());
  }, [greenPointsBalance]);

  useEffect(() => {
    localStorage.setItem('redeemedCoupons', JSON.stringify(redeemedCoupons));
  }, [redeemedCoupons]);

  // Listen for green points updates from other components
  useEffect(() => {
    const handleGreenPointsUpdate = () => {
      const saved = localStorage.getItem('greenPointsBalance');
      if (saved) {
        setGreenPointsBalance(parseInt(saved));
      }
    };

    window.addEventListener('greenPointsUpdated', handleGreenPointsUpdate);
    return () => window.removeEventListener('greenPointsUpdated', handleGreenPointsUpdate);
  }, []);

  const exclusivePerks = [
    { name: 'Cockpit Meet-and-Greet', points: 7500, iconName: 'Crown', description: 'Exclusive tour and photo opportunity' },
    { name: 'Private Lounge Access', points: 3000, iconName: 'Sparkles', description: 'Premium lounge with spa facilities' },
    { name: 'Sustainability Workshop', points: 1500, iconName: 'Star', description: 'Learn from aviation sustainability experts' },
    { name: 'VIP Ground Services', points: 4000, iconName: 'Crown', description: 'Personal assistant at airport' }
  ];

  const travelPerks = [
    { name: 'Priority Boarding', points: 800, iconName: 'Plane', description: 'Board first on your next flight' },
    { name: 'Priority Check-in', points: 700, iconName: 'MapPin', description: 'Skip the queue at check-in' },
    { name: 'Business Class Upgrade', points: 5000, iconName: 'Crown', description: 'One-way upgrade to Business Class' },
    { name: 'Extra Baggage Allowance', points: 1000, iconName: 'Gift', description: '+10kg baggage allowance' },
    { name: 'Seat Selection', points: 400, iconName: 'Plane', description: 'Choose your preferred seat' }
  ];

  const travelComforts = [
    { name: 'Inflight WiFi Access', points: 800, iconName: 'Wifi', description: 'Full flight internet access' },
    { name: 'Gourmet Meal Voucher', points: 700, iconName: 'Coffee', description: 'Premium meal selection' },
    { name: 'Amenity Kit Upgrade', points: 500, iconName: 'Gift', description: 'Luxury travel essentials' },
    { name: 'In-flight Entertainment Plus', points: 400, iconName: 'Star', description: 'Extended content library' },
    { name: 'Complimentary Beverages', points: 300, iconName: 'Coffee', description: 'Premium drinks on board' }
  ];

  const milesMore = [
    { name: '100 Asia Miles', points: 1200, iconName: 'Trophy', description: 'Exchange for Asia Miles' },
    { name: '250 Asia Miles', points: 3000, iconName: 'Trophy', description: 'Exchange for Asia Miles' },
    { name: '500 Asia Miles', points: 6000, iconName: 'Trophy', description: 'Exchange for Asia Miles' },
    { name: '1,000 Asia Miles', points: 12000, iconName: 'Trophy', description: 'Exchange for Asia Miles' }
  ];

  const canAfford = (points: number) => greenPointsBalance >= points;

  const generatePromoCode = (rewardName: string): string => {
    const prefix = rewardName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const CouponCard = ({ coupon, index }: { coupon: RedeemedCoupon; index: number }) => {
    const Icon = iconMap[coupon.iconName];
    const daysUntilExpiry = Math.ceil((coupon.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry <= 7;
    const [copied, setCopied] = useState(false);

    const copyPromoCode = () => {
      if (coupon.promoCode) {
        navigator.clipboard.writeText(coupon.promoCode);
        setCopied(true);
        toast.success('Promo code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3>{coupon.name}</h3>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Ticket className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
              
              {/* Promo Code Section - Show if available */}
              {coupon.promoCode && (
                <div className="mb-3 p-2.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Booking Promo Code</p>
                      <p className="text-sm font-mono text-primary">{coupon.promoCode}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-primary/20"
                      onClick={copyPromoCode}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Enter this code when booking your flight</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Expires {formatDate(coupon.expiryDate)}
                    {isExpiringSoon && (
                      <span className="ml-1 text-orange-600 font-medium">
                        ({daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left)
                      </span>
                    )}
                  </span>
                </div>
                <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90" onClick={() => {
                  setShowQRDialog(true);
                  setSelectedCoupon(coupon);
                }}>
                  Use Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RewardItem = ({ reward }: { reward: { name: string; points: number; iconName: string; description: string } }) => {
    const Icon = iconMap[reward.iconName];
    const affordable = canAfford(reward.points);

    return (
      <div className={`p-4 rounded-lg border transition-all ${
        affordable 
          ? 'bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer' 
          : 'bg-muted/30 border-muted'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${
            affordable ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <Icon className={`h-5 w-5 ${affordable ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={affordable ? '' : 'text-muted-foreground'}>{reward.name}</h3>
              {!affordable && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={affordable 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-muted text-muted-foreground border-muted-foreground/20'
                }
              >
                {reward.points} pts
              </Badge>
              {affordable && (
                <Button size="sm" variant="outline" className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/5" onClick={() => {
                  const promoCode = generatePromoCode(reward.name);
                  setGreenPointsBalance(greenPointsBalance - reward.points);
                  setRedeemedCoupons([...redeemedCoupons, {
                    name: reward.name,
                    points: reward.points,
                    iconName: reward.iconName,
                    description: reward.description,
                    redeemedDate: new Date(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    promoCode: promoCode
                  }]);
                  toast.success(`Redeemed ${reward.name}! Promo code: ${promoCode}`);
                }}>
                  Redeem
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="tracking-wide">GreenPoints Rewards</h1>
            <div className="text-xs opacity-90 mt-1">Redeem sustainable travel perks</div>
          </div>
          <div className="text-xs opacity-90 uppercase tracking-wider">Cathay</div>
        </div>
        
        {/* Balance Display */}
        <Card className="bg-white/10 border-white/20 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-90 mb-1 text-white">Your Balance</div>
                <div className="text-2xl text-white font-bold">{greenPointsBalance} GreenPoints</div>
              </div>
              <Trophy className="h-10 w-10 opacity-80 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Redeemed Coupons Section - Shows at top */}
        {redeemedCoupons.length > 0 && (
          <>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="h-5 w-5 text-accent" />
                <h2 className="text-primary">Redeemed Coupons</h2>
                <Badge variant="secondary" className="ml-1">
                  {redeemedCoupons.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {redeemedCoupons.map((coupon, index) => (
                  <CouponCard key={index} coupon={coupon} index={index} />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Exclusive Perks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-5 w-5 text-accent" />
            <h2 className="text-primary">Exclusive Perks</h2>
          </div>
          <div className="space-y-3">
            {exclusivePerks.map((reward, index) => (
              <RewardItem key={index} reward={reward} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Travel Perks */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-5 w-5 text-primary" />
            <h2 className="text-primary">Travel Perks</h2>
          </div>
          <div className="space-y-3">
            {travelPerks.map((reward, index) => (
              <RewardItem key={index} reward={reward} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Travel Comforts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coffee className="h-5 w-5 text-primary" />
            <h2 className="text-primary">Travel Comforts</h2>
          </div>
          <div className="space-y-3">
            {travelComforts.map((reward, index) => (
              <RewardItem key={index} reward={reward} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Miles & More */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="text-primary">Miles & More</h2>
          </div>
          <div className="space-y-3">
            {milesMore.map((reward, index) => (
              <RewardItem key={index} reward={reward} />
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      {selectedCoupon && (
        <QRCodeDialog
          open={showQRDialog}
          onOpenChange={setShowQRDialog}
          couponName={selectedCoupon.name}
          couponDescription={selectedCoupon.description}
          expiryDate={selectedCoupon.expiryDate}
          iconName={selectedCoupon.iconName}
        />
      )}
    </div>
  );
}