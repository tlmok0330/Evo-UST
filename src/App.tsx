import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { TravelPlanner } from './components/TravelPlanner';
import { Itinerary } from './components/Itinerary';
import { Rewards } from './components/Rewards';
import { Community } from './components/Community';
import { Profile } from './components/Profile';
import { LayoutDashboard, Palmtree, Calendar, Trophy, Users, UserCircle } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type Page = 'dashboard' | 'holiday' | 'itinerary' | 'rewards' | 'community' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20">
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'holiday' && <TravelPlanner onNavigate={setCurrentPage} />}
        {currentPage === 'itinerary' && <Itinerary />}
        {currentPage === 'rewards' && <Rewards />}
        {currentPage === 'community' && <Community />}
        {currentPage === 'profile' && <Profile />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border shadow-lg z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'dashboard'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage('holiday')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'holiday'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Palmtree className="h-5 w-5" />
            <span className="text-xs">Holiday</span>
          </button>

          <button
            onClick={() => setCurrentPage('itinerary')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'itinerary'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Itinerary</span>
          </button>

          <button
            onClick={() => setCurrentPage('rewards')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'rewards'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Rewards</span>
          </button>

          <button
            onClick={() => setCurrentPage('community')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'community'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Community</span>
          </button>

          <button
            onClick={() => setCurrentPage('profile')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              currentPage === 'profile'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCircle className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      <Toaster />
    </div>
  );
}