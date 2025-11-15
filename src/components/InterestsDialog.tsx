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
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { X, Plus, Leaf, Palmtree } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';

interface InterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentInterests: string[];
  onSave: (interests: string[]) => void;
}

// Predefined interest categories
const POPULAR_INTERESTS = [
  'Beach Resorts',
  'Mountain Hiking',
  'City Tours',
  'Cultural Tours',
  'Food & Cuisine',
  'Adventure Sports',
  'Photography',
  'Shopping',
  'Historical Sites',
  'Nightlife',
  'Wildlife Safari',
  'Cruise Travel',
];

const ECO_INTERESTS = [
  'Eco-Lodges',
  'Sustainable Tourism',
  'Wildlife Conservation',
  'Green Hotels',
  'Organic Farms',
  'Carbon-Neutral Travel',
  'Renewable Energy Sites',
  'Zero-Waste Travel',
  'Marine Conservation',
  'Forest Bathing',
  'Eco-Volunteering',
  'Green Transportation',
];

export function InterestsDialog({
  open,
  onOpenChange,
  currentInterests,
  onSave,
}: InterestsDialogProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentInterests);
  const [customInterest, setCustomInterest] = useState('');

  // Update selected interests when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedInterests(currentInterests);
      setCustomInterest('');
    }
  }, [open, currentInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (!trimmed) {
      toast.error('Please enter an interest');
      return;
    }
    
    if (selectedInterests.includes(trimmed)) {
      toast.error('This interest is already added');
      return;
    }

    setSelectedInterests(prev => [...prev, trimmed]);
    setCustomInterest('');
    toast.success('Custom interest added!');
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handleSave = () => {
    onSave(selectedInterests);
    toast.success('Interests updated successfully!');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Travel Interests</DialogTitle>
          <DialogDescription>
            Select from popular categories or add your own custom interests
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <div className="space-y-6 py-2">
            {/* Current Selected Interests */}
            {selectedInterests.length > 0 && (
              <div>
                <Label className="text-sm mb-2 block">Your Selected Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest, index) => (
                    <Badge 
                      key={index}
                      className="bg-primary text-primary-foreground pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Travel Interests */}
            <div>
              <Label className="text-sm mb-3 flex items-center gap-2">
                <Palmtree className="h-4 w-4 text-primary" />
                Popular Travel Interests
              </Label>
              <div className="space-y-3">
                {POPULAR_INTERESTS.map((interest) => (
                  <div key={interest} className="flex items-center space-x-3">
                    <Checkbox
                      id={`popular-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <label
                      htmlFor={`popular-${interest}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        selectedInterests.includes(interest) ? 'font-semibold' : 'font-normal'
                      }`}
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Eco-Travel Interests */}
            <div>
              <Label className="text-sm mb-3 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Eco-Travel Interests
              </Label>
              <div className="space-y-3">
                {ECO_INTERESTS.map((interest) => (
                  <div key={interest} className="flex items-center space-x-3">
                    <Checkbox
                      id={`eco-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <label
                      htmlFor={`eco-${interest}`}
                      className={`text-sm cursor-pointer flex-1 ${
                        selectedInterests.includes(interest) ? 'font-semibold' : 'font-normal'
                      }`}
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interest Input */}
            <div className="pb-2">
              <Label className="text-sm mb-2 block">Add Custom Interest</Label>
              <div className="flex gap-2">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your own interest..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addCustomInterest}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter or click + to add
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
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
          >
            Save Interests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}