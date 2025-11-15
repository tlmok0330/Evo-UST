import { DayPlan } from './TravelPlanner';
import { DayCard } from './DayCard';
import { HotelCard } from './HotelCard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface ItineraryViewProps {
  dayPlans: DayPlan[];
  onTogglePin: (dayId: string, activityId: string) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onAddActivity: (dayId: string) => void;
  onAddDay: () => void;
}

export function ItineraryView({
  dayPlans,
  onTogglePin,
  onDeleteActivity,
  onAddActivity,
  onAddDay
}: ItineraryViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (dayPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-muted-foreground mb-4">
          No travel plans yet
        </div>
        <Button onClick={onAddDay}>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Day
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Trip Header */}
      <div className="mb-2">
        <h2 className="text-primary">Hong Kong → Tokyo</h2>
        <div className="text-sm text-muted-foreground mt-1">
          3-day adventure • November 20-22, 2025
        </div>
      </div>

      {/* Hotel Card */}
      <HotelCard />

      {/* Daily Itinerary */}
      {dayPlans.map((day, index) => (
        <DayCard
          key={day.id}
          dayPlan={day}
          dayNumber={index + 1}
          formattedDate={formatDate(day.date)}
          onTogglePin={onTogglePin}
          onDeleteActivity={onDeleteActivity}
          onAddActivity={() => onAddActivity(day.id)}
        />
      ))}
    </div>
  );
}