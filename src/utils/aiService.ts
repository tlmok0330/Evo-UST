import { projectId, publicAnonKey } from './supabase/info';

export interface AIActivitySuggestion {
  title: string;
  time: string;
  location: string;
  isEcoFriendly: boolean;
  description?: string;
  partnerName?: string;
  matchingInterests?: string[]; // User interests that match this activity
}

export interface AIItineraryRequest {
  destination: string;
  dayNumber: number;
  totalDays: number;
  existingActivities?: Array<{
    title: string;
    time: string;
  }>;
  allActivitiesInTrip?: Array<{
    dayNumber: number;
    title: string;
  }>;
  preferences?: string[];
  userInterests?: string[]; // Add user interests
  flightConstraints?: {
    isFirstDay?: boolean;
    isLastDay?: boolean;
    departureTime?: string; // Time when departure flight lands (available from)
    returnTime?: string; // Time when return flight departs (available until)
  };
}

/**
 * Get AI-powered activity suggestions for a specific day in an itinerary
 */
export async function getAIActivitySuggestions(
  request: AIItineraryRequest
): Promise<AIActivitySuggestion[]> {
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-db8b1db2/chat`;
    
    // Build list of all activities already in the trip to avoid duplicates
    const allActivitiesText = request.allActivitiesInTrip && request.allActivitiesInTrip.length > 0
      ? `\n\nActivities already planned in this ${request.totalDays}-day trip (DO NOT REPEAT ANY OF THESE):\n${request.allActivitiesInTrip.map(a => `- Day ${a.dayNumber}: ${a.title}`).join('\n')}`
      : '';
    
    // Build a contextual prompt for current day
    const existingActivitiesText = request.existingActivities && request.existingActivities.length > 0
      ? `\n\nExisting activities already scheduled for Day ${request.dayNumber}:\n${request.existingActivities.map(a => `- ${a.time}: ${a.title}`).join('\n')}`
      : '';
    
    // Add user interests context - PRIORITIZE USER INTERESTS
    const userInterestsText = request.userInterests && request.userInterests.length > 0
      ? `\n\nUser's interests: ${request.userInterests.join(', ')}.`
      : '';
    
    // Add flight time constraints
    let flightConstraintsText = '';
    if (request.flightConstraints) {
      if (request.flightConstraints.isFirstDay && request.flightConstraints.departureTime) {
        const arrivalTime = calculateArrivalTime(request.flightConstraints.departureTime);
        flightConstraintsText = `\n\nNote: First day - activities must start after ${arrivalTime}.`;
      } else if (request.flightConstraints.isLastDay && request.flightConstraints.returnTime) {
        flightConstraintsText = `\n\nNote: Last day - activities must end before ${request.flightConstraints.returnTime}.`;
      }
    }
    
    const prompt = `Suggest 1-2 activities for Day ${request.dayNumber} in ${request.destination}.${allActivitiesText}${existingActivitiesText}${userInterestsText}${flightConstraintsText}

Return ONLY a JSON array:
[
  {
    "title": "Activity Name",
    "time": "HH:MM",
    "location": "Location",
    "description": "Brief description",
    "partnerName": "Partner",
    "isEcoFriendly": true,
    "matchingInterests": []
  }
]`;

    console.log('=== AI SUGGESTION REQUEST ===');
    console.log('User Interests being sent to AI:', request.userInterests);
    console.log('Destination:', request.destination);
    console.log('Day:', request.dayNumber);
    console.log('=============================');
    console.log('Requesting AI suggestions for:', request);

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        messages: [],
        userMessage: prompt,
      }),
    });

    // Check if the response is ok and is JSON
    if (!response.ok) {
      console.log('AI API not available, using fallback suggestions');
      return generateFallbackSuggestions(request);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('AI response is not JSON, using fallback suggestions');
      return generateFallbackSuggestions(request);
    }

    // Check if response indicates we should use fallback
    const data = await response.json();
    
    if (data.fallback || data.error) {
      console.log('Server indicated fallback should be used');
      return generateFallbackSuggestions(request);
    }

    console.log('AI response:', data);

    let suggestions: AIActivitySuggestion[];

    try {
      // Check if response is empty or missing
      if (!data.response || data.response.trim() === '') {
        console.error('❌ AI returned empty response, using fallback');
        return generateFallbackSuggestions(request);
      }

      // Try to parse the response as JSON
      const aiResponse = data.response.trim();
      
      // Remove any instruction tokens or markdown formatting
      let cleanedResponse = aiResponse
        .replace(/\[B_INST\].*?\[\/B_INST\]/gs, '') // Remove instruction tokens
        .replace(/<s>/g, '') // Remove <s> tokens
        .replace(/<\/s>/g, '') // Remove </s> tokens
        .replace(/```json\s*/g, '') // Remove ```json markdown
        .replace(/```\s*/g, '') // Remove ``` markdown
        .trim();
      
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(cleanedResponse);
      }

      // Validate the suggestions
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      // Ensure each suggestion has required fields
      suggestions = suggestions.map((s, index) => ({
        title: s.title || `Activity ${index + 1}`,
        time: s.time || '10:00',
        location: s.location || request.destination,
        isEcoFriendly: s.isEcoFriendly !== false,
        description: s.description || '',
        partnerName: s.partnerName || '',
        matchingInterests: s.matchingInterests || [],
      }));

      // ALWAYS match activities with user interests using our own logic to ensure accuracy
      // This ensures only the user's selected interests are shown, not AI hallucinations
      if (request.userInterests && request.userInterests.length > 0) {
        suggestions = suggestions.map(s => ({
          ...s,
          matchingInterests: matchActivityWithInterests(s, request.userInterests!),
        }));
      }

    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', data.response);
      
      // Fallback to generated suggestions based on destination
      suggestions = generateFallbackSuggestions(request);
    }

    return suggestions;

  } catch (error) {
    console.error('AI Service Error:', error);
    // Return fallback suggestions on error - this is normal when AI service is unavailable
    console.log('Using fallback suggestions instead');
    return generateFallbackSuggestions(request);
  }
}

/**
 * Save AI suggestions to Supabase (when user connects)
 */
export async function saveAISuggestionsToSupabase(
  itineraryId: string,
  dayNumber: number,
  suggestions: AIActivitySuggestion[]
): Promise<void> {
  try {
    // This will be implemented when Supabase is connected
    console.log('Saving AI suggestions to Supabase:', { itineraryId, dayNumber, suggestions });
    
    // TODO: Implement Supabase storage
    // const { error } = await supabase
    //   .from('ai_suggestions')
    //   .insert({
    //     itinerary_id: itineraryId,
    //     day_number: dayNumber,
    //     suggestions: suggestions,
    //     created_at: new Date().toISOString(),
    //   });
    
  } catch (error) {
    console.error('Error saving suggestions to Supabase:', error);
  }
}

/**
 * Generate fallback suggestions when AI fails
 */
function generateFallbackSuggestions(request: AIItineraryRequest): AIActivitySuggestion[] {
  const destination = request.destination;
  
  // Single default activity to indicate AI is not working
  const defaultActivity: AIActivitySuggestion = {
    title: 'Default',
    time: '14:00',
    location: destination,
    description: 'AI suggestion feature is not available',
    partnerName: 'System',
    isEcoFriendly: false,
    matchingInterests: [],
  };

  return [defaultActivity];
}

/**
 * Calculate arrival time based on departure time (assumes 10-hour flight)
 */
function calculateArrivalTime(departureTime: string): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const arrivalHours = (hours + 10) % 24;
  return `${arrivalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Subtract hours from a time string
 */
function subtractHours(timeStr: string, hoursToSubtract: number): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let newHours = hours - hoursToSubtract;
  if (newHours < 0) newHours += 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Match activity with user interests
 */
function matchActivityWithInterests(activity: AIActivitySuggestion, userInterests: string[]): string[] {
  const matchingInterests: string[] = [];
  
  // Combine title, description, and location for matching
  const activityText = `${activity.title} ${activity.description || ''} ${activity.location}`;
  const activityLower = activityText.toLowerCase();
  
  // Define interest keywords for better matching - Updated to match InterestsDialog options
  const interestKeywords: Record<string, string[]> = {
    // Popular Travel Interests (from InterestsDialog)
    'Beach Resorts': ['beach', 'resort', 'ocean', 'sea', 'coastal', 'surf', 'swimming', 'sand', 'seaside'],
    'Mountain Hiking': ['mountain', 'hiking', 'peak', 'alpine', 'climb', 'trail', 'summit', 'trek', 'hill'],
    'City Tours': ['city', 'urban', 'downtown', 'neighborhood', 'walking tour', 'sightseeing', 'metropolitan'],
    'Cultural Tours': ['cultural', 'culture', 'museum', 'heritage', 'history', 'temple', 'traditional', 'art', 'gallery', 'historic', 'monument'],
    'Food & Cuisine': ['food', 'cuisine', 'dining', 'restaurant', 'culinary', 'tasting', 'cooking', 'chef', 'market', 'wine', 'gastronomy', 'meal'],
    'Adventure Sports': ['adventure', 'sports', 'kayaking', 'rafting', 'diving', 'climbing', 'cycling', 'zip', 'water sports', 'extreme', 'adrenaline'],
    'Photography': ['photography', 'photo', 'scenic', 'viewpoint', 'panoramic', 'instagram', 'camera', 'landscape', 'sunset', 'sunrise'],
    'Shopping': ['shopping', 'market', 'boutique', 'mall', 'store', 'retail', 'souvenir', 'bazaar', 'fashion'],
    'Historical Sites': ['historical', 'historic', 'ancient', 'heritage', 'monument', 'ruins', 'archaeology', 'castle', 'fortress', 'palace'],
    'Nightlife': ['nightlife', 'bar', 'club', 'entertainment', 'evening', 'night', 'party', 'cocktail', 'music venue'],
    'Wildlife Safari': ['safari', 'wildlife', 'animals', 'game drive', 'nature reserve', 'park', 'zoo', 'bird watching', 'fauna'],
    'Cruise Travel': ['cruise', 'boat', 'ferry', 'sailing', 'yacht', 'ship', 'nautical', 'marine'],
    
    // Eco-Travel Interests (from InterestsDialog)
    'Eco-Lodges': ['eco-lodge', 'eco lodge', 'sustainable accommodation', 'green hotel', 'eco-friendly stay'],
    'Sustainable Tourism': ['sustainable', 'eco-friendly', 'green', 'environmental', 'responsible tourism', 'ethical travel'],
    'Wildlife Conservation': ['conservation', 'wildlife protection', 'endangered species', 'habitat', 'sanctuary', 'preservation'],
    'Green Hotels': ['green hotel', 'eco hotel', 'sustainable hotel', 'environmentally friendly'],
    'Organic Farms': ['organic', 'farm', 'agriculture', 'permaculture', 'farming', 'harvest'],
    'Carbon-Neutral Travel': ['carbon neutral', 'carbon offset', 'low carbon', 'climate friendly'],
    'Renewable Energy Sites': ['renewable', 'solar', 'wind', 'hydro', 'energy', 'sustainable power'],
    'Zero-Waste Travel': ['zero waste', 'waste reduction', 'plastic-free', 'reusable'],
    'Marine Conservation': ['marine', 'ocean', 'coral', 'reef', 'sea life', 'aquatic'],
    'Forest Bathing': ['forest', 'nature', 'woodland', 'trees', 'natural', 'outdoor'],
    'Eco-Volunteering': ['volunteer', 'community', 'giving back', 'service', 'help'],
    'Green Transportation': ['public transport', 'bicycle', 'cycling', 'walking', 'train', 'eco transport'],
    
    // Legacy mappings for backward compatibility
    'Mountain Retreats': ['mountain', 'hiking', 'peak', 'alpine', 'climb', 'trail', 'summit'],
    'Urban Exploration': ['city', 'urban', 'street', 'downtown', 'neighborhood', 'skyscraper', 'shopping', 'nightlife'],
    'Wellness Spa': ['spa', 'wellness', 'massage', 'relaxation', 'yoga', 'meditation', 'hot spring'],
    'Food & Wine': ['food', 'wine', 'dining', 'restaurant', 'culinary', 'tasting', 'cuisine', 'cooking', 'chef', 'market'],
    'Safari Tours': ['safari', 'wildlife', 'animals', 'game drive', 'nature reserve', 'park'],
    'Island Hopping': ['island', 'boat', 'ferry', 'cruise', 'sailing', 'yacht'],
  };
  
  userInterests.forEach(interest => {
    const keywords = interestKeywords[interest] || [interest.toLowerCase()];
    
    // Check if any keyword matches
    const hasMatch = keywords.some(keyword => activityLower.includes(keyword));
    
    if (hasMatch) {
      matchingInterests.push(interest);
    }
  });
  
  return matchingInterests;
}