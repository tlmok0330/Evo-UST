import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Leaf, Award, TrendingDown, CheckCircle2 } from 'lucide-react';

export interface SustainableOption {
  id: string;
  action: string;
  greenPoints: number;
  co2Offset: number;
  description: string;
  selected: boolean;
}

interface SustainableFlightOptionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: SustainableOption[]) => void;
  flightInfo?: {
    flightNumber: string;
    destination: string;
    baseGreenPoints: number;
  };
}

export function SustainableFlightOptions({
  open,
  onOpenChange,
  onConfirm,
  flightInfo,
}: SustainableFlightOptionsProps) {
  const [options, setOptions] = useState<SustainableOption[]>([
    {
      id: 'no-headphones',
      action: 'No headphones needed',
      greenPoints: 25,
      co2Offset: 0.5,
      description: 'Use your own headphones and reduce plastic waste',
      selected: false,
    },
    {
      id: 'no-blanket',
      action: 'No in-flight blanket',
      greenPoints: 25,
      co2Offset: 0.5,
      description: 'Skip the single-use blanket and reduce laundry emissions',
      selected: false,
    },
    {
      id: 'pre-order-meal',
      action: 'Pre-ordering meal',
      greenPoints: 50,
      co2Offset: 1.0,
      description: 'Reduce food waste by pre-ordering your meal',
      selected: false,
    },
    {
      id: 'vegetarian-meal',
      action: 'Pre-ordering vegetarian meal',
      greenPoints: 75,
      co2Offset: 1.5,
      description: 'Choose plant-based and reduce your carbon footprint',
      selected: false,
    },
    {
      id: 'light-luggage',
      action: 'Luggage under 15kg',
      greenPoints: 300,
      co2Offset: 6.0,
      description: 'Lighter aircraft = less fuel = lower emissions',
      selected: false,
    },
  ]);

  const toggleOption = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => {
        // If selecting vegetarian meal, deselect regular meal
        if (id === 'vegetarian-meal' && opt.id === 'pre-order-meal') {
          return { ...opt, selected: false };
        }
        // If selecting regular meal, deselect vegetarian meal
        if (id === 'pre-order-meal' && opt.id === 'vegetarian-meal') {
          return { ...opt, selected: false };
        }
        if (opt.id === id) {
          return { ...opt, selected: !opt.selected };
        }
        return opt;
      })
    );
  };

  const calculateTotals = () => {
    const selected = options.filter((opt) => opt.selected);
    const totalGP = selected.reduce((sum, opt) => sum + opt.greenPoints, 0);
    const totalCO2 = selected.reduce((sum, opt) => sum + opt.co2Offset, 0);
    return { totalGP, totalCO2, count: selected.length };
  };

  const handleConfirm = () => {
    onConfirm(options);
    onOpenChange(false);
  };

  const { totalGP, totalCO2, count } = calculateTotals();
  const grandTotalGP = (flightInfo?.baseGreenPoints || 0) + totalGP;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Boost Your Eco-Impact
          </DialogTitle>
          <DialogDescription>
            Select sustainable flight options to earn additional Green Points and reduce your carbon footprint
          </DialogDescription>
        </DialogHeader>

        {/* Flight Info Banner */}
        {flightInfo && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Flight {flightInfo.flightNumber} to {flightInfo.destination}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Base: <span className="font-semibold text-primary">{flightInfo.baseGreenPoints} GP</span>
                  </span>
                </div>
              </div>
              {count > 0 && (
                <Badge className="bg-green-600 text-white">
                  +{totalGP} GP from actions
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                option.selected
                  ? 'border-green-500 bg-green-50/50 shadow-sm'
                  : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={option.selected}
                  onCheckedChange={() => toggleOption(option.id)}
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{option.action}</span>
                    {option.selected && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-primary font-semibold">
                        +{option.greenPoints} GP
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        {option.co2Offset} kg CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        {count > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-primary/5 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Your Eco-Actions Summary</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {count} {count === 1 ? 'action' : 'actions'} selected
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Additional GP
                </div>
                <div className="text-xl text-primary font-semibold">
                  +{totalGP}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  CO₂ Offset
                </div>
                <div className="text-xl text-green-600 font-semibold">
                  {totalCO2.toFixed(1)} kg
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Total GP
                </div>
                <div className="text-xl text-primary font-semibold">
                  {grandTotalGP}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            {count > 0 ? `Continue with ${count} action${count > 1 ? 's' : ''}` : 'Continue without actions'}
          </Button>
        </div>

        {/* Info Footer */}
        <div className="text-xs text-center text-muted-foreground pt-2 border-t">
          💡 Tip: Light luggage saves the most CO₂! Every kg matters in aviation.
        </div>
      </DialogContent>
    </Dialog>
  );
}
