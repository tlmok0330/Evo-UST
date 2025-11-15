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
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Leaf, Utensils, Headphones, Shirt, Luggage } from 'lucide-react';
import { Separator } from './ui/separator';

interface PreFlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (totalPoints: number) => void;
}

export function PreFlightDialog({ open, onOpenChange, onConfirm }: PreFlightDialogProps) {
  const [noHeadphones, setNoHeadphones] = useState(false);
  const [noBlanket, setNoBlanket] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [lighterLuggage, setLighterLuggage] = useState(false);

  const calculatePoints = () => {
    let points = 0;
    if (noHeadphones) points += 25;
    if (noBlanket) points += 25;
    if (selectedMeal === 'chicken') points += 50;
    if (selectedMeal === 'beef') points += 50;
    if (selectedMeal === 'vegetable') points += 75;
    if (lighterLuggage) points += 300;
    return points;
  };

  const calculateCO2Offset = () => {
    let co2 = 0;
    if (noHeadphones) co2 += 0.5;
    if (noBlanket) co2 += 0.5;
    if (selectedMeal === 'chicken') co2 += 1.0;
    if (selectedMeal === 'beef') co2 += 1.0;
    if (selectedMeal === 'vegetable') co2 += 1.5;
    if (lighterLuggage) co2 += 6.0;
    return co2;
  };

  const handleConfirm = () => {
    const points = calculatePoints();
    const co2Saved = calculateCO2Offset();
    
    console.log('=== Pre-Flight Dialog Confirmed ===');
    console.log('Points Earned:', points);
    console.log('CO2 Saved:', co2Saved);
    
    // Save CO2 offset to localStorage
    const currentCO2Saved = localStorage.getItem('totalCO2Saved');
    const totalCO2Saved = currentCO2Saved ? parseFloat(currentCO2Saved) + co2Saved : co2Saved;
    localStorage.setItem('totalCO2Saved', totalCO2Saved.toFixed(2));
    
    console.log('Previous Total CO2:', currentCO2Saved);
    console.log('New Total CO2:', totalCO2Saved.toFixed(2));
    
    // Update accumulated points as well
    const currentAccumulated = localStorage.getItem('greenPointsAccumulated');
    const accumulatedPoints = currentAccumulated ? parseInt(currentAccumulated) : 0;
    const newAccumulated = accumulatedPoints + points;
    localStorage.setItem('greenPointsAccumulated', newAccumulated.toString());
    
    console.log('Previous Accumulated Points:', currentAccumulated);
    console.log('New Accumulated Points:', newAccumulated);
    console.log('===================================');
    
    // Dispatch event to update Dashboard in real-time
    window.dispatchEvent(new Event('greenPointsUpdated'));
    
    // Reset form
    setNoHeadphones(false);
    setNoBlanket(false);
    setSelectedMeal('');
    setLighterLuggage(false);
    
    onConfirm(points);
    onOpenChange(false);
  };

  const totalPoints = calculatePoints();
  const totalCO2 = calculateCO2Offset();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Leaf className="h-5 w-5 text-green-600" />
            Pre-Flight Preferences
          </DialogTitle>
          <DialogDescription>
            Make sustainable choices and earn GreenPoints for your journey
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* No Headphones Option */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Headphones className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="no-headphones" className="cursor-pointer">
                    No Headphones Needed
                  </Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    +25 pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bring your own or skip to reduce waste • Saves 0.5 kg CO₂
                </p>
              </div>
            </div>
            <Checkbox
              id="no-headphones"
              checked={noHeadphones}
              onCheckedChange={(checked) => setNoHeadphones(checked as boolean)}
            />
          </div>

          {/* No Blanket Option */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shirt className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="no-blanket" className="cursor-pointer">
                    No In-flight Blanket
                  </Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    +25 pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduce laundry and packaging waste • Saves 0.5 kg CO₂
                </p>
              </div>
            </div>
            <Checkbox
              id="no-blanket"
              checked={noBlanket}
              onCheckedChange={(checked) => setNoBlanket(checked as boolean)}
            />
          </div>

          <Separator />

          {/* Pre-order Meal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Utensils className="h-4 w-4 text-primary" />
              </div>
              <Label>Pre-order Your Meal</Label>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Pre-ordering helps reduce food waste
            </p>

            <RadioGroup value={selectedMeal} onValueChange={setSelectedMeal} className="space-y-3 ml-11">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <RadioGroupItem value="chicken" id="chicken" />
                  <div className="flex-1">
                    <Label htmlFor="chicken" className="cursor-pointer">
                      Teriyaki Chicken with Rice
                    </Label>
                    <p className="text-xs text-muted-foreground">Grilled chicken breast with vegetables • Saves 1.0 kg CO₂</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  +50 pts
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <RadioGroupItem value="beef" id="beef" />
                  <div className="flex-1">
                    <Label htmlFor="beef" className="cursor-pointer">
                      Braised Beef with Potatoes
                    </Label>
                    <p className="text-xs text-muted-foreground">Tender beef in rich gravy • Saves 1.0 kg CO₂</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  +50 pts
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-green-200 bg-green-50/50 hover:border-green-300 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <RadioGroupItem value="vegetable" id="vegetable" />
                  <div className="flex-1">
                    <Label htmlFor="vegetable" className="cursor-pointer">
                      Mediterranean Vegetable Medley
                    </Label>
                    <p className="text-xs text-muted-foreground">Roasted vegetables with quinoa and herbs • Saves 1.5 kg CO₂</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-600 text-white border-green-700">
                  +75 pts ⭐
                </Badge>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Lighter Luggage Option */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Luggage className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="lighter-luggage" className="cursor-pointer">
                    Bringing Lighter Luggage
                  </Label>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    +300 pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Under 15kg helps reduce fuel consumption • Saves 6.0 kg CO₂
                </p>
              </div>
            </div>
            <Switch
              id="lighter-luggage"
              checked={lighterLuggage}
              onCheckedChange={setLighterLuggage}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          {/* Points & CO2 Summary */}
          {totalPoints > 0 && (
            <div className="w-full space-y-2">
              <div className="p-4 rounded-lg bg-green-100 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Total GreenPoints:</span>
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-xl text-green-700">{totalPoints} pts</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <span className="text-sm">Total CO₂ Saved:</span>
                  <span className="text-lg text-green-700">{totalCO2.toFixed(2)} kg</span>
                </div>
              </div>
            </div>
          )}

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
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={totalPoints === 0}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}