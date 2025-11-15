import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, Calendar, Clock, MapPin, Star, Leaf, X } from 'lucide-react';
import { Badge } from './ui/badge';

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    title: string;
    time: string;
    location: string;
    date: string;
    partnerName?: string;
    description?: string;
    isEcoFriendly?: boolean;
  } | null;
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  activity,
}: BookingConfirmationDialogProps) {
  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Booking Confirmed
            </DialogTitle>
            <DialogDescription className="sr-only">
              Your booking has been successfully confirmed
            </DialogDescription>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Banner */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">
                  Your booking is confirmed!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-lg text-foreground">
                {activity.title}
              </h4>
              {activity.partnerName && (
                <div className="flex items-center gap-1 text-sm text-purple-700 mt-1">
                  <Star className="h-3 w-3" />
                  <span className="italic">By {activity.partnerName}</span>
                </div>
              )}
            </div>

            {activity.description && (
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            )}

            {/* Booking Information */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{activity.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{activity.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{activity.location}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmed & Paid
              </Badge>
              {activity.isEcoFriendly && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <Leaf className="h-3 w-3 mr-1" />
                  Eco-Friendly
                </Badge>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Important:</strong> Please arrive 15 minutes before the scheduled time. 
              Bring your booking confirmation email and a valid ID.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // In a real app, this would generate/download a PDF
                alert('Confirmation PDF would be downloaded');
              }}
            >
              Download Confirmation
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}