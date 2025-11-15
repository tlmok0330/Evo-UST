import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { QrCode, CheckCircle2, Calendar, Ticket } from 'lucide-react';
import { useMemo } from 'react';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponName: string;
  couponDescription: string;
  expiryDate: Date;
  iconName: string;
}

export function QRCodeDialog({ 
  open, 
  onOpenChange, 
  couponName, 
  couponDescription, 
  expiryDate,
  iconName 
}: QRCodeDialogProps) {
  
  // Generate a unique coupon ID and QR code URL
  const couponId = useMemo(() => {
    return `CP-${iconName}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }, [iconName]);

  // Generate QR code image URL using a free QR code API
  const qrCodeUrl = useMemo(() => {
    const qrData = JSON.stringify({
      couponId,
      name: couponName,
      type: 'CATHAY_PACIFIC_REWARD',
      issuer: 'Cathay Pacific Green Points',
      expires: expiryDate.toISOString()
    });
    // Using QR Server API to generate QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData)}&color=006564&bgcolor=FFFFFF`;
  }, [couponId, couponName, expiryDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-center text-primary flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            Coupon QR Code
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Present this code to Cathay Pacific staff
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4 py-4">
          {/* QR Code Canvas with Border */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg blur-xl"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg border-4 border-primary/20">
              <img 
                src={qrCodeUrl}
                className="block"
                style={{ width: '280px', height: '280px' }}
              />
            </div>
          </div>

          {/* Coupon Details Card */}
          <div className="w-full space-y-3 p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/20">
            {/* Coupon Name */}
            <div className="text-center">
              <h3 className="text-primary mb-1">{couponName}</h3>
              <p className="text-sm text-muted-foreground">{couponDescription}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Ticket className="h-3 w-3 mr-1" />
                {couponId}
              </Badge>
            </div>

            {/* Expiry Info */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
              <Calendar className="h-3.5 w-3.5" />
              <span>Valid until {formatDate(expiryDate)}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-xs text-center text-muted-foreground">
              This QR code is unique and can only be used once. Show this to Cathay Pacific staff at the counter, gate, or lounge for verification.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onOpenChange(false)} 
          className="w-full bg-primary hover:bg-primary/90"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}