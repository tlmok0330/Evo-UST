import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, Phone, Building2, Check, Leaf } from 'lucide-react';
import { Badge } from './ui/badge';

export function HotelCard() {
  return (
    <Card className="shadow-md border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-primary">The Peninsula Tokyo</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                <Leaf className="h-3 w-3" />
                50 pts
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              5-star luxury hotel in Marunouchi
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          November 20-22, 2025 • 3 nights
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0 mt-0.5" />
            <div>
              <div>1-8-1 Yurakucho, Chiyoda-ku</div>
              <div className="text-muted-foreground">Tokyo 100-0006, Japan</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary/60" />
            <span>+81 3-6270-2888</span>
          </div>
        </div>

        <div className="pt-3 border-t border-primary/10">
          <div className="text-sm">
            <span className="text-muted-foreground">Check-in:</span> 3:00 PM • 
            <span className="text-muted-foreground ml-2">Check-out:</span> 12:00 PM
          </div>
        </div>
      </CardContent>
    </Card>
  );
}