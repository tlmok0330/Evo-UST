// Types for itinerary storage

export interface Activity {
  id: string;
  title: string;
  time: string;
  location: string;
  isPinned: boolean;
  isEcoFriendly?: boolean;
  partnerName?: string;
  description?: string;
  isBooked?: boolean;
  matchingInterests?: string[];
  isAIRecommended?: boolean;
}

export interface SavedItinerary {
  id: string;
  destination: string;
  tripType?: string;
  flights?: Array<{
    type: string;
    flightNumber: string;
    airline: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    date: string;
    carbonSaved: number;
    greenPoints: number;
    isEcoFriendly: boolean;
  }>;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  greenPoints: number;
  isEcoFriendly: boolean;
  savedDate: Date;
  hotel?: {
    id: string;
    name: string;
    location: string;
    rating: number;
    pricePerNight: number;
    isEcoFriendly: boolean;
    greenPoints: number;
    amenities: string[];
  };
  dayPlans?: {
    id: string;
    date: string;
    activities: Activity[];
  }[];
}