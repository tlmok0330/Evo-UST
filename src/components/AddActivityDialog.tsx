import { useState } from 'react';
import { Activity } from './TravelPlanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  dayNumber?: number;
}

export function AddActivityDialog({ open, onOpenChange, onAddActivity, dayNumber }: AddActivityDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    location: '',
    isEcoFriendly: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activity: Omit<Activity, 'id'> = {
      title: formData.title,
      time: formData.time,
      location: formData.location,
      isPinned: false,
      isEcoFriendly: formData.isEcoFriendly,
    };
    
    onAddActivity(activity);
    setFormData({
      title: '',
      time: '',
      location: '',
      isEcoFriendly: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Activity {dayNumber && `to Day ${dayNumber}`}</DialogTitle>
          <DialogDescription>
            Add a new activity to your itinerary
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Activity Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Visit Museum"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                step="60"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown Museum"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="eco-friendly" className="flex flex-col space-y-1">
                <span>Eco-Friendly Activity</span>
                <span className="text-xs text-muted-foreground">
                  Mark if this is a sustainable activity
                </span>
              </Label>
              <Switch
                id="eco-friendly"
                checked={formData.isEcoFriendly}
                onCheckedChange={(checked) => setFormData({ ...formData, isEcoFriendly: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}