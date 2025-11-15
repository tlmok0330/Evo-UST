import { useEffect, useRef, useState } from 'react';
import { DayPlan } from './TravelPlanner';
import { MapPin, Pin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface MapViewProps {
  dayPlans: DayPlan[];
}

export function MapView({ dayPlans }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    title: string;
    location: string;
    time: string;
    day: number;
  } | null>(null);

  // Collect all locations
  const allLocations = dayPlans.flatMap((day, dayIndex) =>
    day.activities.map(activity => ({
      ...activity,
      dayNumber: dayIndex + 1,
      date: day.date
    }))
  );

  // Get only pinned locations
  const pinnedLocations = allLocations.filter(loc => loc.isPinned);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw map background (simplified streets)
    ctx.fillStyle = '#f0f0ed';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (streets)
    ctx.strokeStyle = '#e0e0db';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Convert lat/lng to canvas coordinates (simplified projection)
    const locations = pinnedLocations.length > 0 ? pinnedLocations : allLocations;
    
    if (locations.length === 0) return;

    const lats = locations.map(l => l.location.lat);
    const lngs = locations.map(l => l.location.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padding = 40;
    const mapWidth = width - padding * 2;
    const mapHeight = height - padding * 2;

    const toX = (lng: number) => {
      if (maxLng === minLng) return width / 2;
      return padding + ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    };

    const toY = (lat: number) => {
      if (maxLat === minLat) return height / 2;
      return padding + ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
    };

    // Draw route lines between consecutive activities
    if (locations.length > 1) {
      ctx.strokeStyle = '#006564';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      locations.forEach((loc, i) => {
        const x = toX(loc.location.lng);
        const y = toY(loc.location.lat);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw location markers
    locations.forEach((loc, index) => {
      const x = toX(loc.location.lng);
      const y = toY(loc.location.lat);

      // Draw marker pin
      ctx.fillStyle = loc.isPinned ? '#d4b896' : '#006564';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw marker border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });

  }, [dayPlans, pinnedLocations, allLocations]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const locations = pinnedLocations.length > 0 ? pinnedLocations : allLocations;
    
    if (locations.length === 0) return;

    const lats = locations.map(l => l.location.lat);
    const lngs = locations.map(l => l.location.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const padding = 40;
    const mapWidth = rect.width - padding * 2;
    const mapHeight = rect.height - padding * 2;

    const toX = (lng: number) => {
      if (maxLng === minLng) return rect.width / 2;
      return padding + ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    };

    const toY = (lat: number) => {
      if (maxLat === minLat) return rect.height / 2;
      return padding + ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
    };

    // Check if click is near any marker
    for (const loc of locations) {
      const markerX = toX(loc.location.lng);
      const markerY = toY(loc.location.lat);
      const distance = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2));

      if (distance < 15) {
        setSelectedLocation({
          title: loc.title,
          location: loc.location.name,
          time: loc.time,
          day: loc.dayNumber
        });
        return;
      }
    }

    setSelectedLocation(null);
  };

  const displayLocations = pinnedLocations.length > 0 ? pinnedLocations : allLocations;

  return (
    <div className="relative h-full flex flex-col">
      {/* Filter Badge */}
      {pinnedLocations.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="default" className="flex items-center gap-1 bg-accent text-accent-foreground border-accent shadow-md">
            <Pin className="h-3 w-3" />
            Showing Pinned Only
          </Badge>
        </div>
      )}

      {/* Canvas Map */}
      <canvas
        ref={canvasRef}
        className="flex-1 w-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card className="m-4 shadow-md border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 text-primary">{selectedLocation.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary/60" />
                    <span className="truncate">{selectedLocation.location}</span>
                  </div>
                  <div>Day {selectedLocation.day} • {selectedLocation.time}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="p-4 border-t bg-card shadow-sm">
        <div className="text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Locations:</span>
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">{displayLocations.length}</Badge>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Pinned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}