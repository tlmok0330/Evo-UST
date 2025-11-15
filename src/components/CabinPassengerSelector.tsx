import { useState } from 'react';
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
import { Minus, Plus } from 'lucide-react';

interface CabinPassengerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinClass: string;
  adults: number;
  children: number;
  onConfirm: (cabinClass: string, adults: number, children: number) => void;
}

export function CabinPassengerSelector({
  open,
  onOpenChange,
  cabinClass: initialCabinClass,
  adults: initialAdults,
  children: initialChildren,
  onConfirm,
}: CabinPassengerSelectorProps) {
  const [selectedCabin, setSelectedCabin] = useState(initialCabinClass);
  const [adultsCount, setAdultsCount] = useState(initialAdults);
  const [childrenCount, setChildrenCount] = useState(initialChildren);

  const cabinOptions = [
    { value: 'Economy', label: 'Economy' },
    { value: 'Premium Economy', label: 'Premium Economy' },
    { value: 'Business', label: 'Business' },
    { value: 'First Class', label: 'First Class' },
  ];

  const handleConfirm = () => {
    onConfirm(selectedCabin, adultsCount, childrenCount);
    onOpenChange(false);
  };

  const incrementAdults = () => {
    if (adultsCount < 9) setAdultsCount(adultsCount + 1);
  };

  const decrementAdults = () => {
    if (adultsCount > 1) setAdultsCount(adultsCount - 1);
  };

  const incrementChildren = () => {
    if (childrenCount < 9) setChildrenCount(childrenCount + 1);
  };

  const decrementChildren = () => {
    if (childrenCount > 0) setChildrenCount(childrenCount - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cabin Class & Passengers</DialogTitle>
          <DialogDescription>
            Select your preferred cabin class and number of passengers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cabin Class Selection */}
          <div className="space-y-2">
            <Label className="text-base">Cabin Class</Label>
            <div className="space-y-2">
              {cabinOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedCabin(option.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedCabin === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{option.label}</div>
                    {selectedCabin === option.value && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Passengers Selection */}
          <div className="space-y-3">
            <Label className="text-base">Passengers</Label>
            
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Adults</div>
                <div className="text-sm text-muted-foreground">Age 12+</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementAdults}
                  disabled={adultsCount <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{adultsCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementAdults}
                  disabled={adultsCount >= 9}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Children</div>
                <div className="text-sm text-muted-foreground">Age 2-11</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementChildren}
                  disabled={childrenCount <= 0}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{childrenCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementChildren}
                  disabled={childrenCount >= 9}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
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