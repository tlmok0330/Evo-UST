import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Leaf, Image as ImageIcon, MapPin, Award, Lightbulb } from 'lucide-react';
import { Separator } from './ui/separator';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (post: any) => void;
  prefilledData?: {
    caption?: string;
    location?: string;
    ecoActions?: string[];
  };
}

export function CreatePostDialog({ open, onOpenChange, onPost, prefilledData }: CreatePostDialogProps) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [ecoActions, setEcoActions] = useState<string[]>([]);

  // Update form when prefilled data changes
  useEffect(() => {
    if (prefilledData && open) {
      setCaption(prefilledData.caption || '');
      setLocation(prefilledData.location || '');
      setEcoActions(prefilledData.ecoActions || []);
    }
  }, [prefilledData, open]);

  const ecoActionOptions = [
    { id: 'public-transport', label: 'Used public transport', points: 30 },
    { id: 'bike', label: 'Cycled or walked', points: 40 },
    { id: 'reusable', label: 'Brought reusable items', points: 20 },
    { id: 'local-food', label: 'Ate at local restaurants', points: 25 },
    { id: 'eco-hotel', label: 'Stayed at eco-certified hotel', points: 50 },
    { id: 'no-plastic', label: 'Avoided single-use plastics', points: 35 },
  ];

  const toggleEcoAction = (actionId: string) => {
    setEcoActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const calculatePoints = () => {
    return ecoActions.reduce((total, actionId) => {
      const action = ecoActionOptions.find(opt => opt.id === actionId);
      return total + (action?.points || 0);
    }, 0);
  };

  const handlePost = () => {
    onPost({
      caption,
      location,
      ecoActions,
      pointsEarned: 0,
    });
    // Reset form
    setCaption('');
    setLocation('');
    setEcoActions([]);
    onOpenChange(false);
  };

  const totalPoints = calculatePoints();
  const isValid = caption.length > 0 && location.length > 0 && ecoActions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Leaf className="h-5 w-5 text-green-600" />
            Share Your Eco-Travel Journey
          </DialogTitle>
          <DialogDescription>
            Inspire others and earn GreenPoints for your sustainable choices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload Placeholder */}
          <div className="w-full h-48 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Add photos (coming soon)</p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Tell your story</Label>
            <Textarea
              id="caption"
              placeholder="Share what made your trip sustainable and memorable..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {caption.length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Add Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., Tokyo, Japan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <Separator />

          {/* Eco Actions */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <Label>Tag Your Eco-Actions</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Let others know how you traveled sustainably
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {ecoActionOptions.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    ecoActions.includes(action.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                  onClick={() => toggleEcoAction(action.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={ecoActions.includes(action.id)}
                      onCheckedChange={() => toggleEcoAction(action.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label className="cursor-pointer" htmlFor={action.id}>
                      {action.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-blue-900">Pro Tips for Sharing</div>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• Share specific details about your eco-choices</li>
                  <li>• Tag locations to help others discover green spots</li>
                  <li>• Inspire the community with beautiful photos</li>
                  <li>• Tag your actions to help others learn from your journey</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePost}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!isValid}
            >
              Share Post
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}