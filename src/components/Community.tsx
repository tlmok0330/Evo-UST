import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { 
  Trophy,
  ChevronRight,
  Camera,
  Utensils,
  CreditCard,
  Droplet,
  Bike,
  ShoppingCart,
  CheckCircle2,
  Briefcase,
  Leaf,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  X,
  Search,
  UserPlus,
  UserCheck,
  Trash2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CreatePostDialog } from './CreatePostDialog';
import { toast } from 'sonner';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { extractKeywordsFromPost, savePostToSupabase, deletePostFromSupabase } from '../utils/keywordService';

interface Achievement {
  id: string;
  icon: any;
  color: string;
  bgColor: string;
  earned: boolean;
  title: string;
  description: string;
  date: string;
  milestone: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isFriend: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  points: number;
  isConnected: boolean;
}

interface OtherPost {
  id: string;
  username: string;
  userAvatar: string;
  date: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
  ecoActions: string[];
  isLiked?: boolean;
}

export function Community() {
  const [selectedPost, setSelectedPost] = useState<OtherPost | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedFriends, setConnectedFriends] = useState<Set<string>>(new Set(['1', '3']));
  const [prefilledPostData, setPrefilledPostData] = useState<{
    caption?: string;
    location?: string;
    ecoActions?: string[];
  } | undefined>(undefined);
  const [showFullFeed, setShowFullFeed] = useState(false);

  // Default posts that are always visible
  const defaultPosts: OtherPost[] = [];

  // Load user posts from localStorage and combine with default posts
  const [othersPosts, setOthersPosts] = useState<OtherPost[]>(() => {
    const savedUserPosts = localStorage.getItem('userCommunityPosts');
    const userPosts = savedUserPosts ? JSON.parse(savedUserPosts) : [];
    // User posts first, then default posts
    return [...userPosts, ...defaultPosts];
  });

  const achievements: Achievement[] = [
    { id: '1', icon: Leaf, color: 'text-orange-600', bgColor: 'bg-orange-100', earned: true, title: 'Eco Warrior', description: 'Successfully reduced food waste on 10 trips', date: 'Nov 24', milestone: '10 Trips' },
    { id: '2', icon: CreditCard, color: 'text-blue-500', bgColor: 'bg-blue-100', earned: true, title: 'Digital Pioneer', description: 'Used digital boarding passes for all flights this year', date: 'Nov 24', milestone: '12 Flights' },
    { id: '3', icon: Utensils, color: 'text-green-600', bgColor: 'bg-green-100', earned: true, title: 'Green Gourmet', description: 'Enjoyed plant-based meals on 15 consecutive flights', date: 'Nov 24', milestone: '15 Meals' },
    { id: '4', icon: Droplet, color: 'text-yellow-600', bgColor: 'bg-yellow-100', earned: true, title: 'Water Guardian', description: 'Conserved water resources across multiple journeys', date: 'Nov 24', milestone: '5 Hotels' },
    { id: '5', icon: Bike, color: 'text-blue-500', bgColor: 'bg-blue-100', earned: true, title: 'Pedal Power', description: 'Chose cycling over cars in 8 different cities', date: 'Nov 24', milestone: '8 Cities' },
    { id: '6', icon: ShoppingCart, color: 'text-pink-500', bgColor: 'bg-pink-100', earned: true, title: 'Zero Waste Hero', description: 'Consistently used reusable containers while traveling', date: 'Nov 24', milestone: '20 Days' },
    { id: '7', icon: Briefcase, color: 'text-green-500', bgColor: 'bg-green-100', earned: true, title: 'Light Traveler', description: 'Packed lighter luggage to reduce carbon footprint', date: 'Nov 24', milestone: '25 Flights' },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Emily S', points: 3420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyS', isFriend: true },
    { rank: 2, name: 'Alex W', points: 2850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexW', isFriend: true },
    { rank: 3, name: 'Michael T', points: 2680, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelT', isFriend: true },
    { rank: 4, name: 'Sarah K', points: 2310, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK', isFriend: true },
    { rank: 5, name: 'David L', points: 2150, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidL', isFriend: true },
    { rank: 6, name: 'Jessica M', points: 1980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JessicaM', isFriend: true },
    { rank: 7, name: 'Ryan B', points: 1850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RyanB', isFriend: false },
    { rank: 8, name: 'Lisa W', points: 1720, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaW', isFriend: true },
  ];

  const friends: Friend[] = [
    { id: '1', name: 'Alex W', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexW', points: 2850, isConnected: true },
    { id: '2', name: 'John D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnD', points: 1420, isConnected: false },
    { id: '3', name: 'Emily S', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyS', points: 3420, isConnected: true },
    { id: '4', name: 'Michael T', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelT', points: 2680, isConnected: true },
    { id: '5', name: 'Sarah K', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK', points: 2310, isConnected: true },
    { id: '6', name: 'David L', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidL', points: 2150, isConnected: true },
    { id: '7', name: 'Jessica M', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JessicaM', points: 1980, isConnected: true },
    { id: '8', name: 'Kevin P', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KevinP', points: 1850, isConnected: false },
    { id: '9', name: 'Lisa W', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaW', points: 1720, isConnected: true },
    { id: '10', name: 'Robert H', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertH', points: 1650, isConnected: false },
    { id: '11', name: 'Amanda C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AmandaC', points: 1580, isConnected: false },
    { id: '12', name: 'Chris N', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChrisN', points: 1490, isConnected: false },
    { id: '13', name: 'Michelle R', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichelleR', points: 1380, isConnected: false },
    { id: '14', name: 'Daniel G', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielG', points: 1290, isConnected: false },
    { id: '15', name: 'Rachel T', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RachelT', points: 1210, isConnected: false },
    { id: '16', name: 'James F', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesF', points: 1150, isConnected: false },
    { id: '17', name: 'Laura S', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LauraS', points: 1090, isConnected: false },
    { id: '18', name: 'Thomas B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThomasB', points: 1020, isConnected: false },
    { id: '19', name: 'Jennifer K', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JenniferK', points: 980, isConnected: false },
    { id: '20', name: 'Matthew J', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MatthewJ', points: 920, isConnected: false },
  ];

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCreatePost = async (postData: any) => {
    // Map eco action IDs to readable labels
    const ecoActionLabels: Record<string, string> = {
      'public-transport': 'Used Public Transport',
      'bike': 'Cycled or Walked',
      'reusable': 'Brought Reusable Items',
      'local-food': 'Ate Local Food',
      'eco-hotel': 'Eco-Certified Hotel',
      'no-plastic': 'Avoided Single-Use Plastics',
    };

    // Process eco actions: map known IDs to labels, keep custom hashtags as-is
    const ecoActionsLabeled = postData.ecoActions.map((action: string) => {
      // If it's a known eco action ID, use the label
      if (ecoActionLabels[action]) {
        return ecoActionLabels[action];
      }
      // Otherwise it's a custom hashtag, return as-is with # prefix
      return action.startsWith('#') ? action : `#${action}`;
    });

    // Get username from localStorage (same as Profile page)
    const username = localStorage.getItem('userName') || 'Sarah Chen';

    const newPost: OtherPost = {
      id: `post-${Date.now()}`,
      username: username,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      date: 'Just now',
      caption: postData.caption + (postData.location ? `\n📍 ${postData.location}` : ''),
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBqb3VybmV5fGVufDF8fHx8MTc2MzE5MTYxOXww&ixlib=rb-4.1.0&q=80&w=1080',
      likes: 0,
      comments: 0,
      ecoActions: ecoActionsLabeled,
      isLiked: false
    };

    // Save to localStorage for persistence
    const savedUserPosts = localStorage.getItem('userCommunityPosts');
    const userPosts = savedUserPosts ? JSON.parse(savedUserPosts) : [];
    userPosts.unshift(newPost); // Add to beginning
    localStorage.setItem('userCommunityPosts', JSON.stringify(userPosts));

    // Add the new post to the beginning of the array
    setOthersPosts(prev => [newPost, ...prev]);
    
    // Extract keywords and save to Supabase (async, non-blocking)
    extractKeywordsFromPost(newPost.caption, ecoActionsLabeled)
      .then(async (keywords) => {
        console.log('Extracted keywords:', keywords);
        
        // Save to Supabase
        const saved = await savePostToSupabase({
          id: newPost.id,
          username: newPost.username,
          caption: newPost.caption,
          image: newPost.image,
          ecoActions: ecoActionsLabeled,
          keywords: keywords,
        });
        
        if (saved) {
          console.log('Post and keywords saved to Supabase successfully');
          toast.success('Keywords extracted!', {
            description: `Keywords: ${keywords.join(', ')}`,
          });
        }
      })
      .catch((error) => {
        console.error('Error processing keywords:', error);
      });
    
    toast.success('Post shared successfully!', {
      description: 'Thank you for sharing your sustainable travel journey!',
    });
    setIsCreateDialogOpen(false);
    
    // Reset prefilled data
    setPrefilledPostData(undefined);
  };

  const toggleFriendConnection = (friendId: string) => {
    setConnectedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
        toast.info('Friend disconnected');
      } else {
        newSet.add(friendId);
        toast.success('Friend connected!');
      }
      return newSet;
    });
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the post detail dialog
    
    // Check if post can be deleted (only user posts, not default posts)
    const isDefaultPost = defaultPosts.some(p => p.id === postId);
    if (isDefaultPost) {
      toast.error('Cannot delete this post');
      return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    // Remove from state
    setOthersPosts(prev => prev.filter(p => p.id !== postId));
    
    // Remove from localStorage
    const savedUserPosts = localStorage.getItem('userCommunityPosts');
    if (savedUserPosts) {
      const userPosts = JSON.parse(savedUserPosts);
      const updatedPosts = userPosts.filter((p: OtherPost) => p.id !== postId);
      localStorage.setItem('userCommunityPosts', JSON.stringify(updatedPosts));
    }
    
    // Delete from Supabase
    try {
      const deleted = await deletePostFromSupabase(postId);
      if (deleted) {
        toast.success('Post deleted successfully!');
      } else {
        toast.info('Post removed locally', {
          description: 'Could not delete from database',
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.info('Post removed locally', {
        description: 'Could not connect to database',
      });
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current user data
  const currentUser = {
    id: 'current-user',
    name: 'You',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    points: 2450, // User's current points
    isConnected: true,
  };

  // Build friends leaderboard from connected friends + current user, sorted by points
  const friendsLeaderboard = [
    currentUser,
    ...friends.filter(friend => connectedFriends.has(friend.id))
  ]
    .sort((a, b) => b.points - a.points) // Sort by points descending
    .map((friend, index) => ({
      rank: index + 1,
      name: friend.name,
      points: friend.points,
      avatar: friend.avatar,
      isFriend: true,
      isCurrentUser: friend.id === 'current-user',
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="tracking-wide">Community</h1>
            <div className="text-xs opacity-90 mt-1">Share your green journey</div>
          </div>
          <div className="text-xs opacity-90 uppercase tracking-wider">Cathay</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-4">
          {/* Find & Connect with Friends */}
          <Card className="bg-gray-100 border-0 shadow-lg p-5">
            <h2 className="text-xl mb-4">Find & Connect with Friends</h2>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Friend List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{friend.name}</div>
                        <div className="text-xs text-muted-foreground">{friend.points} GP</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={connectedFriends.has(friend.id) ? 'outline' : 'default'}
                      className={connectedFriends.has(friend.id) ? '' : 'bg-primary hover:bg-primary/90'}
                      onClick={() => toggleFriendConnection(friend.id)}
                    >
                      {connectedFriends.has(friend.id) ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No friends found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Friends Leaderboard */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl p-5 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Friends Leaderboard
                </h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  {friendsLeaderboard.length} Friends
                </Badge>
              </div>
              
              {friendsLeaderboard.length > 0 ? (
                <>
                  {/* Podium */}
                  <div className="relative mb-8 pb-4">
                    {/* Confetti decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                      <div className="absolute top-8 left-1/4 text-yellow-400 text-xl animate-bounce">✨</div>
                      <div className="absolute top-6 right-1/4 text-orange-400 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
                    </div>
                    
                    <div className="flex items-end justify-center gap-3">
                      {/* Render podium in correct order: 2nd - 1st - 3rd */}
                      {(() => {
                        const topThree = friendsLeaderboard.slice(0, 3);
                        const first = topThree.find(e => e.rank === 1);
                        const second = topThree.find(e => e.rank === 2);
                        const third = topThree.find(e => e.rank === 3);
                        
                        // Order: [second, first, third] for proper display
                        const orderedPodium = [second, first, third].filter(Boolean);
                        
                        return orderedPodium.map((entry) => {
                          if (!entry) return null;
                          
                          const isFirst = entry.rank === 1;
                          const isSecond = entry.rank === 2;
                          const isThird = entry.rank === 3;
                          
                          // Position-based styling
                          const avatarSize = isFirst ? 'h-14 w-14' : 'h-12 w-12';
                          const trophyBg = isFirst 
                            ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500' 
                            : isSecond 
                            ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500'
                            : 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500';
                          const trophyIconColor = 'text-white';
                          const podiumHeight = isFirst ? 'h-32' : isSecond ? 'h-24' : 'h-20';
                          const podiumBg = isFirst
                            ? 'bg-gradient-to-b from-yellow-400 to-yellow-500'
                            : isSecond
                            ? 'bg-gradient-to-b from-gray-400 to-gray-500'
                            : 'bg-gradient-to-b from-orange-400 to-orange-500';
                          
                          return (
                            <div 
                              key={entry.rank} 
                              className={`flex flex-col items-center transition-all duration-300 hover:scale-105 ${isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'}`}
                            >
                              {/* Crown for first place */}
                              {isFirst && (
                                <div className="text-2xl mb-1 animate-bounce">👑</div>
                              )}
                              
                              {/* Avatar with glow effect */}
                              <div className={`relative ${isFirst ? 'mb-3' : 'mb-2'}`}>
                                <div className={`absolute inset-0 ${trophyBg} rounded-full blur-md opacity-50 animate-pulse`} />
                                <Avatar className={`${avatarSize} border-3 border-white shadow-xl relative z-10 ring-2 ${isFirst ? 'ring-yellow-400' : isSecond ? 'ring-gray-400' : 'ring-orange-400'}`}>
                                  <AvatarImage src={entry.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">{entry.name[0]}</AvatarFallback>
                                </Avatar>
                              </div>
                              
                              {/* Name with highlight for current user */}
                              <div className={`text-center mb-2 ${isFirst ? 'max-w-[100px]' : 'max-w-[80px]'}`}>
                                <div className={`${isFirst ? 'text-sm' : 'text-xs'} truncate ${(entry as any).isCurrentUser ? 'font-bold text-primary' : ''}`}>
                                  {entry.name}
                                </div>
                              </div>
                              
                              {/* Trophy Badge */}
                              <div className={`${trophyBg} rounded-full p-2 mb-2 shadow-lg`}>
                                <Trophy className={`${isFirst ? 'h-6 w-6' : 'h-5 w-5'} ${trophyIconColor}`} />
                              </div>
                              
                              {/* Points Badge */}
                              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md mb-2">
                                <span className={`${isFirst ? 'text-sm' : 'text-xs'}`}>{entry.points} GP</span>
                              </div>
                              
                              {/* Podium */}
                              <div className={`${podiumBg} w-20 ${podiumHeight} rounded-t-2xl flex flex-col items-center justify-center text-white shadow-xl relative overflow-hidden`}>
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
                                <div className={`${isFirst ? 'text-4xl' : 'text-3xl'} relative z-10`}>#{entry.rank}</div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    {/* Podium base */}
                    <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-b-lg shadow-inner mt-0" />
                  </div>

                  {/* Other Friends with enhanced styling */}
                  {friendsLeaderboard.length > 3 && (
                    <div className="space-y-2">
                      <h3 className="text-sm flex items-center gap-2 mb-3 text-muted-foreground">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        <span>All Rankings</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      </h3>
                      {friendsLeaderboard.slice(3).map((entry, idx) => (
                        <div 
                          key={entry.rank} 
                          className={`bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 hover:scale-[1.02] border ${(entry as any).isCurrentUser ? 'border-primary border-2 bg-primary/5' : 'border-gray-100'}`}
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank badge */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${(entry as any).isCurrentUser ? 'bg-gradient-to-br from-primary to-primary/80 text-white' : 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary'}`}>
                              <span className="text-sm">#{entry.rank}</span>
                            </div>
                            
                            {/* Avatar */}
                            <Avatar className="h-10 w-10 border-2 border-gray-100 shadow-sm">
                              <AvatarImage src={entry.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xs">{entry.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            {/* Name */}
                            <div className={`text-sm ${(entry as any).isCurrentUser ? 'font-bold text-primary' : ''}`}>{entry.name}</div>
                          </div>
                          
                          {/* Points with icon */}
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              <Leaf className="h-3 w-3 mr-1" />
                              {entry.points} GP
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="relative inline-block mb-4">
                    <Trophy className="h-16 w-16 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-dashed border-gray-300 rounded-full" />
                    </div>
                  </div>
                  <p className="text-lg mb-1">No Friends Yet</p>
                  <p className="text-sm">Connect with friends to see rankings!</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card className="bg-gray-100 border-0 shadow-lg p-5">
          <h2 className="text-xl mb-4">Recent Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className="flex-shrink-0 flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-2"
              >
                <div className="relative">
                  <div className={`${achievement.bgColor} p-4 rounded-2xl border-4 border-white shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
                    <achievement.icon className={`h-8 w-8 ${achievement.color}`} />
                  </div>
                  {achievement.earned && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Others' Footprint */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white">Others' Footprint</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFullFeed(true)}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2"
                size="sm"
              >
                <Camera className="h-4 w-4" />
                View All Posts
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-white text-primary hover:bg-white/90 gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Share Your Journey
              </Button>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {othersPosts.map((post) => {
              // Check if this is a user post (can be deleted)
              const isDefaultPost = defaultPosts.some(p => p.id === post.id);
              const canDelete = !isDefaultPost;
              
              return (
                <Card 
                  key={post.id} 
                  className="flex-shrink-0 w-64 bg-gray-100 border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow relative"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm mb-3 whitespace-pre-line line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {post.username} · {post.date}
                      </p>
                      {/* Delete button for user posts */}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDeletePost(post.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>Post by {selectedPost?.username}</DialogTitle>
              <DialogDescription>View and interact with community post</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          {selectedPost && (
            <div className="bg-white">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedPost.userAvatar} />
                    <AvatarFallback>{selectedPost.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{selectedPost.username}</div>
                    <div className="text-xs text-muted-foreground">{selectedPost.date}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedPost(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Post Image */}
              <div className="relative w-full aspect-square bg-muted">
                <ImageWithFallback
                  src={selectedPost.image}
                  alt={selectedPost.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Post Actions and Content */}
              <div className="p-4 space-y-3">
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(selectedPost.id);
                      }}
                    >
                      <Heart
                        className={`h-6 w-6 transition-colors ${
                          likedPosts.has(selectedPost.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-foreground'
                        }`}
                      />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
                      <Send className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 p-0 hover:bg-transparent">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>

                {/* Likes Count */}
                <div className="text-sm">
                  <span>{selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)} likes</span>
                </div>

                {/* Caption */}
                <div className="text-sm">
                  <span className="mr-2">{selectedPost.username}</span>
                  <span className="text-muted-foreground whitespace-pre-line">{selectedPost.caption}</span>
                </div>

                {/* Eco Actions Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedPost.ecoActions.map((action, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200 text-xs"
                    >
                      #{action.replace(/\s+/g, '')}
                    </Badge>
                  ))}
                </div>

                {/* Comments Preview */}
                {selectedPost.comments > 0 && (
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    View all {selectedPost.comments} comments
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPost={handleCreatePost}
        prefilledData={prefilledPostData}
      />

      {/* Achievement Details Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Milestone Reached! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Celebrating your sustainable journey
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-6 py-4">
              {/* Achievement Icon */}
              <div className="flex justify-center relative">
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-2xl opacity-50 animate-pulse" />
                </div>
                <div className="relative z-10">
                  <div className={`${selectedAchievement.bgColor} p-10 rounded-full border-8 border-white shadow-2xl transform hover:scale-105 transition-transform`}>
                    <selectedAchievement.icon className={`h-20 w-20 ${selectedAchievement.color}`} />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-3 shadow-xl animate-bounce">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="text-center space-y-3">
                <div className="space-y-1">
                  <h3 className="text-2xl">{selectedAchievement.title}</h3>
                  <Badge variant="outline" className="border-primary text-primary">
                    {selectedAchievement.milestone}
                  </Badge>
                </div>
                <p className="text-muted-foreground px-4">{selectedAchievement.description}</p>
                
                {/* Milestone Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Milestone Unlocked</span>
                </div>
              </div>

              {/* Date Earned */}
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Achieved on {selectedAchievement.date}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "Every sustainable choice creates a ripple of positive change"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAchievement(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Map achievement to eco-actions
                    const getEcoActionsForAchievement = (achievementId: string) => {
                      const mapping: Record<string, string[]> = {
                        '1': ['reusable', 'local-food'], // Eco Warrior - food waste
                        '2': ['public-transport'], // Digital Pioneer - digital boarding pass
                        '3': ['local-food'], // Green Gourmet - plant-based meals
                        '4': ['reusable'], // Water Guardian - water conservation
                        '5': ['bike'], // Pedal Power - cycling
                        '6': ['no-plastic', 'reusable'], // Zero Waste Hero - reusable containers
                        '7': ['eco-hotel'], // Light Traveler - lighter luggage
                      };
                      return mapping[achievementId] || [];
                    };

                    setPrefilledPostData({
                      caption: `🎉 Just unlocked the "${selectedAchievement!.title}" milestone! ${selectedAchievement!.description} 🌱\n\nI'm proud to be on this sustainable travel journey. ${selectedAchievement!.milestone} and counting! 💚\n\n#SustainableTravel #GreenJourney #CathayPacific`,
                      location: '',
                      ecoActions: getEcoActionsForAchievement(selectedAchievement!.id),
                    });
                    setSelectedAchievement(null);
                    setIsCreateDialogOpen(true);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Share Achievement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Feed Dialog - Instagram Style */}
      <Dialog open={showFullFeed} onOpenChange={setShowFullFeed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-0 bg-white overflow-hidden flex flex-col">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>All Community Posts</DialogTitle>
              <DialogDescription>Browse all posts from the community</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
            <div>
              <h2 className="text-xl">Community Feed</h2>
              <p className="text-sm text-muted-foreground">{othersPosts.length} posts</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowFullFeed(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Posts Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {othersPosts.map((post) => {
                const isDefaultPost = defaultPosts.some(p => p.id === post.id);
                const canDelete = !isDefaultPost;
                
                return (
                  <Card
                    key={post.id}
                    className="bg-white border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] relative group"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowFullFeed(false);
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-square relative">
                      <ImageWithFallback
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white">
                          <Heart className="h-6 w-6" />
                          <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <MessageCircle className="h-6 w-6" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={post.userAvatar} />
                          <AvatarFallback>{post.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">{post.username}</p>
                          <p className="text-xs text-muted-foreground">{post.date}</p>
                        </div>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.id, e);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                        {post.caption}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* Empty State */}
            {othersPosts.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">No Posts Yet</p>
                <p className="text-sm">Be the first to share your sustainable journey!</p>
                <Button
                  onClick={() => {
                    setShowFullFeed(false);
                    setIsCreateDialogOpen(true);
                  }}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}