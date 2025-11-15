import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Clock, MapPin, Star, Leaf } from 'lucide-react';
import { Badge } from './ui/badge';

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: { blockId: string; dayIndex: number; activity: any } | null;
  onCancelBooking: (blockId: string, dayIndex: number, activity: any) => void;
}

export function CancelBookingDialog({ 
  open, 
  onOpenChange, 
  activity,
  onCancelBooking 
}: CancelBookingDialogProps) {
  if (!activity) return null;

  const handleConfirmCancel = () => {
    onCancelBooking(activity.blockId, activity.dayIndex, activity.activity);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Activity Details */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-4 space-y-3">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-sm flex-1">{activity.activity.title}</h3>
              {activity.activity.isEcoFriendly && (
                <Badge className="bg-green-600 text-white text-xs">
                  <Leaf className="h-3 w-3 mr-1" />
                  Eco
                </Badge>
              )}
            </div>
            
            {activity.activity.description && (
              <p className="text-xs text-muted-foreground mb-3">
                {activity.activity.description}
              </p>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{activity.activity.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{activity.activity.location}</span>
              </div>
              {activity.activity.partnerName && (
                <div className="flex items-center gap-2 text-xs text-purple-700">
                  <Star className="h-3 w-3" />
                  <span className="italic">By {activity.activity.partnerName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-green-300">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-700">Status</span>
              <Badge className="bg-green-600 text-white">Confirmed & Paid</Badge>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900">
              <p className="mb-1">
                <span className="font-medium">Cancellation Policy:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-red-800">
                <li>This action cannot be undone</li>
                <li>Refund will be processed within 5-7 business days</li>
                <li>Cancellation fees may apply</li>
                <li>The activity will be removed from your itinerary</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmCancel}
          >
            Yes, Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
