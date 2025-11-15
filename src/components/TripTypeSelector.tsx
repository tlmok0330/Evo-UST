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
import { useState } from 'react';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';

interface TripTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripType: string;
  onConfirm: (tripType: string) => void;
}

export function TripTypeSelector({
  open,
  onOpenChange,
  tripType: initialTripType,
  onConfirm,
}: TripTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState(initialTripType);

  const tripOptions = [
    { 
      value: 'Return', 
      label: 'Return Trip', 
      description: 'Round trip with return date',
      icon: ArrowLeftRight 
    },
    { 
      value: 'One-way', 
      label: 'One-way', 
      description: 'Single journey without return',
      icon: ArrowRight 
    },
  ];

  const handleConfirm = () => {
    onConfirm(selectedType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trip Type</DialogTitle>
          <DialogDescription>
            Select your trip type
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {tripOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedType === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedType === option.value ? 'bg-primary text-white' : 'bg-muted'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  {selectedType === option.value && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
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
            onClick={handleConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
