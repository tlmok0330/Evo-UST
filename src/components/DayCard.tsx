import { DayPlan } from './TravelPlanner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Pin, MapPin, Clock, Trash2, Plus, Leaf } from 'lucide-react';
import { Badge } from './ui/badge';

interface DayCardProps {
  dayPlan: DayPlan;
  dayNumber: number;
  formattedDate: string;
  onTogglePin: (dayId: string, activityId: string) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onAddActivity: () => void;
}

export function DayCard({
  dayPlan,
  dayNumber,
  formattedDate,
  onTogglePin,
  onDeleteActivity,
  onAddActivity
}: DayCardProps) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary">Day {dayNumber}</CardTitle>
            <div className="text-muted-foreground text-sm mt-1">
              {formattedDate}
            </div>
          </div>
          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
            {dayPlan.activities.length} {dayPlan.activities.length === 1 ? 'activity' : 'activities'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dayPlan.activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No activities planned for this day
          </div>
        ) : (
          dayPlan.activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 rounded-lg border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="truncate">{activity.title}</h3>
                    {activity.isPinned && (
                      <Pin className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                    )}
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {activity.greenPoints} pts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary/60" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary/60" />
                      <span className="truncate">{activity.location.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent/20"
                    onClick={() => onTogglePin(dayPlan.id, activity.id)}
                  >
                    <Pin className={`h-4 w-4 ${activity.isPinned ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteActivity(dayPlan.id, activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        <Button
          variant="outline"
          className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
          onClick={onAddActivity}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </CardContent>
    </Card>
  );
}