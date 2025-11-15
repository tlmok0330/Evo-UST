import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Award, 
  Crown, 
  Gem, 
  Star, 
  Shield, 
  Edit,
  Calendar,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { InterestsDialog } from './InterestsDialog';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { saveUserInterests } from '../utils/userInterestsService';

// Tier system configuration (matches Dashboard)
const TIERS = [
  { 
    name: 'Bronze', 
    minPoints: 0, 
    maxPoints: 2999, 
    icon: Award,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500/20 to-amber-600/10',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  { 
    name: 'Silver', 
    minPoints: 3000, 
    maxPoints: 9999, 
    icon: Star,
    color: 'text-gray-600',
    bgGradient: 'from-gray-400/20 to-gray-500/10',
    badgeColor: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  { 
    name: 'Gold', 
    minPoints: 10000, 
    maxPoints: 24999, 
    icon: Crown,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-400/20 to-yellow-500/10',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  { 
    name: 'Diamond', 
    minPoints: 25000, 
    maxPoints: Infinity, 
    icon: Gem,
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-400/20 to-cyan-500/10',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-300'
  }
];

const getTierInfo = (points: number) => {
  const currentTier = TIERS.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || TIERS[0];
  const currentTierIndex = TIERS.indexOf(currentTier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  
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

export function Profile() {
  const [accumulatedPoints, setAccumulatedPoints] = useState(() => {
    const saved = localStorage.getItem('greenPointsAccumulated');
    return saved ? parseInt(saved) : 12467; // Gold tier status
  });

  const [greenPoints, setGreenPoints] = useState(() => {
    const saved = localStorage.getItem('greenPointsBalance');
    return saved ? parseInt(saved) : 12467; // Gold tier balance
  });

  const [interests, setInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem('userInterests');
    return saved ? JSON.parse(saved) : ['Beach Resorts', 'Cultural Tours', 'Eco-Lodges'];
  });

  const [isInterestsDialogOpen, setIsInterestsDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User data - load from localStorage with fallback defaults
  const [userData, setUserData] = useState(() => {
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    return {
      name: savedName || 'Sarah Chen',
      email: savedEmail || 'sarah.chen@email.com',
      memberSince: 'January 2022',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${savedName || 'Sarah'}`,
    };
  });

  // Temporary state for editing
  const [tempUsername, setTempUsername] = useState(userData.name);
  const [tempEmail, setTempEmail] = useState(userData.email);

  // Listen for green points updates
  useEffect(() => {
    const handleGreenPointsUpdate = () => {
      const savedBalance = localStorage.getItem('greenPointsBalance');
      const savedAccumulated = localStorage.getItem('greenPointsAccumulated');
      if (savedBalance) {
        setGreenPoints(parseInt(savedBalance));
      }
      if (savedAccumulated) {
        setAccumulatedPoints(parseInt(savedAccumulated));
      }
    };

    window.addEventListener('greenPointsUpdated', handleGreenPointsUpdate);
    return () => window.removeEventListener('greenPointsUpdated', handleGreenPointsUpdate);
  }, []);

  const handleInterestsUpdate = async (newInterests: string[]) => {
    setInterests(newInterests);
    localStorage.setItem('userInterests', JSON.stringify(newInterests));
    
    // Save to Supabase
    try {
      await saveUserInterests(userData.email, newInterests);
      console.log('Interests saved to Supabase');
    } catch (error) {
      console.error('Failed to save interests to Supabase:', error);
      // Still continue - interests are saved locally
    }
  };

  const handlePasswordChange = () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // In a real app, this would call an API
    toast.success('Password changed successfully!');
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUsernameChange = () => {
    // Validate inputs
    if (!tempUsername) {
      toast.error('Please enter a username');
      return;
    }

    // In a real app, this would call an API
    toast.success('Username changed successfully!');
    setUserData(prev => ({ 
      ...prev, 
      name: tempUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tempUsername}`
    }));
    localStorage.setItem('userName', tempUsername);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('userNameUpdated'));
    
    setIsEditingUsername(false);
  };

  const handleEmailChange = () => {
    // Validate inputs
    if (!tempEmail) {
      toast.error('Please enter an email');
      return;
    }

    // In a real app, this would call an API
    toast.success('Email changed successfully!');
    setUserData(prev => ({ ...prev, email: tempEmail }));
    localStorage.setItem('userEmail', tempEmail);
    setIsEditingEmail(false);
  };

  const handleCancelUsernameChange = () => {
    setIsEditingUsername(false);
    setTempUsername(userData.name);
  };

  const handleCancelEmailChange = () => {
    setIsEditingEmail(false);
    setTempEmail(userData.email);
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const tierInfo = getTierInfo(accumulatedPoints);
  const TierIcon = tierInfo.currentTier.icon;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with User Info */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="flex items-center gap-4 mb-3">
          <Avatar className="h-20 w-20 border-2 border-primary-foreground/20">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback>{getUserInitials(userData.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="tracking-wide">{userData.name}</h1>
            <div className="text-xs opacity-90 mt-1">Marco Polo Club Member</div>
            <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Member since {userData.memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* 1. Member Tier Card */}
        <Card className={`shadow-md border-2 ${tierInfo.currentTier.borderColor}`}>
          <CardHeader className={`${tierInfo.currentTier.bgColor}`}>
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${tierInfo.currentTier.textColor}`}>
                <TierIcon className="h-6 w-6" />
                {tierInfo.currentTier.name} Tier
              </CardTitle>
              <Badge className={tierInfo.currentTier.badgeColor}>
                {accumulatedPoints.toLocaleString()} GP
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Lifetime Earned</span>
                <span>{accumulatedPoints.toLocaleString()} GP</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="text-primary">{greenPoints.toLocaleString()} GP</span>
              </div>
            </div>

            {tierInfo.nextTier && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to {tierInfo.nextTier.name}</span>
                  <span className={tierInfo.nextTier.textColor}>
                    {tierInfo.pointsToNextTier.toLocaleString()} GP to go
                  </span>
                </div>
                <Progress value={tierInfo.progress} className="h-2" />
              </div>
            )}

            {!tierInfo.nextTier && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  🎉 You've reached the highest tier!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Travel Interests Section */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="h-5 w-5" />
                Travel Interests
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsInterestsDialogOpen(true)}
                className="text-primary hover:bg-primary/10"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {interests.length > 0 ? (
              <ScrollArea className="max-h-32">
                <div className="flex flex-wrap gap-2 pr-4">
                  {interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  No interests added yet
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInterestsDialogOpen(true)}
                  className="border-primary/30 text-primary"
                >
                  Add Interests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Account Information */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <div className="py-3 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Username</div>
                </div>
                {!isEditingUsername && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingUsername(true)}
                    className="text-primary hover:bg-primary/10 h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              {!isEditingUsername ? (
                <div className="pl-7">{userData.name}</div>
              ) : (
                <div className="pl-7 mt-2 space-y-2">
                  <Input
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUsernameChange}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelUsernameChange}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="py-3 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Email</div>
                </div>
                {!isEditingEmail && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-primary hover:bg-primary/10 h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              {!isEditingEmail ? (
                <div className="pl-7">{userData.email}</div>
              ) : (
                <div className="pl-7 mt-2 space-y-2">
                  <Input
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="Enter email"
                    type="email"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEmailChange}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEmailChange}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="py-3">
              <div className="flex items-center gap-3 mb-1">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Password</div>
              </div>
              
              {!isChangingPassword ? (
                <div className="flex items-center justify-between pl-7">
                  <div className="text-sm">••••••••</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="pl-7 space-y-3 mt-3">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <Label htmlFor="current-password" className="text-xs text-muted-foreground">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <Label htmlFor="new-password" className="text-xs text-muted-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handlePasswordChange}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Save Password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelPasswordChange}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <InterestsDialog 
        open={isInterestsDialogOpen}
        onOpenChange={setIsInterestsDialogOpen}
        currentInterests={interests}
        onSave={handleInterestsUpdate}
      />
    </div>
  );
}