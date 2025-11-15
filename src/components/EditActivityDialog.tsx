import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Activity } from '../utils/itineraryStorage';

interface EditActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  onSave: (activity: Activity) => void;
}

export function EditActivityDialog({ 
  open, 
  onOpenChange, 
  activity,
  onSave 
}: EditActivityDialogProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setTime(activity.time);
      setLocation(activity.location);
      setIsEcoFriendly(activity.isEcoFriendly || false);
    }
  }, [activity]);

  const handleSave = () => {
    if (!activity) return;
    
    if (!title.trim() || !time.trim() || !location.trim()) {
      return;
    }

    const updatedActivity: Activity = {
      ...activity,
      title: title.trim(),
      time: time.trim(),
      location: location.trim(),
      isEcoFriendly,
    };

    onSave(updatedActivity);
    onOpenChange(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Update the details of your activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Visit Museum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 10:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., City Center"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="eco-friendly"
              checked={isEcoFriendly}
              onCheckedChange={(checked) => setIsEcoFriendly(checked === true)}
            />
            <Label
              htmlFor="eco-friendly"
              className="text-sm cursor-pointer"
            >
              Eco-friendly activity
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={!title.trim() || !time.trim() || !location.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
