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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DiscountCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyCode: (code: string, discount: number) => void;
}

export function DiscountCodeDialog({
  open,
  onOpenChange,
  onApplyCode,
}: DiscountCodeDialogProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setCode('');
      setValidationStatus('idle');
      setErrorMessage('');
      setDiscountAmount(0);
    }
  }, [open]);

  const validateCode = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter a discount code');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setErrorMessage('');

    try {
      // Check if Supabase is configured
      if (!supabase) {
        // Use mock validation for testing without Supabase
        const mockCodes: Record<string, number> = {
          'SAVE10': 10,
          'CATHAY20': 20,
          'ECOFLIGHT': 15,
        };

        const upperCode = code.toUpperCase();
        if (mockCodes[upperCode]) {
          setValidationStatus('valid');
          setDiscountAmount(mockCodes[upperCode]);
        } else {
          setValidationStatus('invalid');
          setErrorMessage('Invalid or expired discount code');
        }
        setIsValidating(false);
        return;
      }

      // Query Supabase for the discount code
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setValidationStatus('invalid');
        setErrorMessage('Invalid or expired discount code');
      } else {
        // Check if code is expired
        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
          setValidationStatus('invalid');
          setErrorMessage('This discount code has expired');
        } else {
          setValidationStatus('valid');
          setDiscountAmount(data.discount_percentage);
        }
      }
    } catch (err) {
      setValidationStatus('invalid');
      setErrorMessage('Error validating code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApply = () => {
    if (validationStatus === 'valid') {
      onApplyCode(code.toUpperCase(), discountAmount);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Discount Code</DialogTitle>
          <DialogDescription>
            Enter your discount code to receive special offers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="discount-code">Discount Code</Label>
            <div className="flex gap-2">
              <Input
                id="discount-code"
                placeholder="Enter code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setValidationStatus('idle');
                  setErrorMessage('');
                }}
                className="uppercase"
                disabled={isValidating}
              />
              <Button
                type="button"
                onClick={validateCode}
                disabled={isValidating || !code.trim()}
                variant="outline"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
          </div>

          {/* Validation Status */}
          {validationStatus === 'valid' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-sm text-green-800">
                  Valid code! You'll save {discountAmount}%
                </div>
              </div>
            </div>
          )}

          {validationStatus === 'invalid' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-800">{errorMessage}</div>
            </div>
          )}

          {/* Sample Codes Info */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-xs text-blue-900">
              💡 Try these sample codes:
              <ul className="mt-2 space-y-1">
                <li>• <span className="font-mono">SAVE10</span> - 10% off</li>
                <li>• <span className="font-mono">CATHAY20</span> - 20% off</li>
                <li>• <span className="font-mono">ECOFLIGHT</span> - 15% off</li>
              </ul>
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
            onClick={handleApply}
            className="bg-primary hover:bg-primary/90"
            disabled={validationStatus !== 'valid'}
          >
            Apply Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}