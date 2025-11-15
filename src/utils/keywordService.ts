import { projectId, publicAnonKey } from './supabase/info';

/**
 * Extract 3 keywords from a post caption using AI
 */
export async function extractKeywordsFromPost(caption: string, ecoActions: string[]): Promise<string[]> {
  // Use fallback method directly for reliability
  // AI keyword extraction can be enabled later when API is more stable
  return extractKeywordsFallback(caption, ecoActions);
}

/**
 * Fallback keyword extraction using simple rules
 */
function extractKeywordsFallback(caption: string, ecoActions: string[]): string[] {
  const keywords: string[] = [];
  
  // More specific activity keywords to look for (focus on concrete activities, not adjectives)
  const activityKeywords = [
    // Specific outdoor activities
    'hiking', 'trekking', 'mountain climbing', 'rock climbing', 'trail running',
    'cycling', 'biking', 'kayaking', 'canoeing', 'rafting', 'snorkeling', 'diving',
    'surfing', 'paddleboarding', 'camping', 'backpacking', 'wildlife watching',
    
    // Specific cultural activities
    'temple visit', 'museum tour', 'art gallery', 'cultural show', 'traditional dance',
    'cooking class', 'food tour', 'market visit', 'craft workshop', 'pottery class',
    'tea ceremony', 'meditation retreat', 'yoga retreat', 'wellness retreat',
    
    // Specific locations/venues
    'national park', 'nature reserve', 'botanical garden', 'historic site',
    'heritage site', 'local market', 'farmers market', 'organic farm', 'eco lodge',
    'sustainability center', 'wildlife sanctuary', 'conservation area',
    
    // Specific food/dining activities
    'farm to table', 'plant based meal', 'vegan restaurant', 'organic cafe',
    'local cuisine', 'street food tour', 'wine tasting', 'farm visit',
    
    // Specific eco activities
    'beach cleanup', 'tree planting', 'volunteering', 'conservation project',
    'eco workshop', 'sustainability tour', 'green building tour', 'solar farm visit',
  ];
  
  // Convert to lowercase for matching
  const lowerCaption = caption.toLowerCase();
  
  // Find matching keywords in caption - prefer longer, more specific phrases first
  const sortedKeywords = activityKeywords.sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    if (lowerCaption.includes(keyword) && keywords.length < 3) {
      keywords.push(keyword);
    }
  }
  
  // Add specific keywords from eco actions if we need more
  if (keywords.length < 3) {
    const ecoKeywordMapping: Record<string, string> = {
      'transport': 'public transportation',
      'bike': 'cycling tour',
      'cycl': 'cycling tour',
      'reusable': 'zero waste practice',
      'food': 'local food experience',
      'hotel': 'eco accommodation',
      'plastic': 'plastic free travel',
    };
    
    for (const action of ecoActions) {
      const lowerAction = action.toLowerCase();
      for (const [key, value] of Object.entries(ecoKeywordMapping)) {
        if (lowerAction.includes(key) && !keywords.includes(value) && keywords.length < 3) {
          keywords.push(value);
        }
      }
    }
  }
  
  // Extract hashtags as specific keywords (they're usually specific activities)
  const hashtagMatches = caption.match(/#(\w+)/g);
  if (hashtagMatches && keywords.length < 3) {
    for (const hashtag of hashtagMatches) {
      const cleanHashtag = hashtag.replace('#', '').toLowerCase();
      // Only add if it's not too generic (more than 4 characters)
      if (cleanHashtag.length > 4 && keywords.length < 3 && !keywords.includes(cleanHashtag)) {
        keywords.push(cleanHashtag);
      }
    }
  }
  
  return keywords.slice(0, 3);
}

/**
 * Save post with keywords to Supabase
 */
export async function savePostToSupabase(post: {
  id: string;
  username: string;
  caption: string;
  image: string;
  ecoActions: string[];
  keywords: string[];
}) {
  try {
    // Import supabase client dynamically
    const { supabase } = await import('../lib/supabase');
    
    // Save post
    const { data: postData, error: postError } = await supabase
      .from('community_posts')
      .insert({
        id: post.id,
        username: post.username,
        caption: post.caption,
        image_url: post.image,
        eco_actions: post.ecoActions,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (postError) {
      console.error('Error saving post:', postError);
      return false;
    }
    
    // Save keywords
    const keywordInserts = post.keywords.map(keyword => ({
      post_id: post.id,
      keyword: keyword.toLowerCase().trim(),
      created_at: new Date().toISOString(),
    }));
    
    const { error: keywordsError } = await supabase
      .from('post_keywords')
      .insert(keywordInserts);
    
    if (keywordsError) {
      console.error('Error saving keywords:', keywordsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in savePostToSupabase:', error);
    return false;
  }
}

/**
 * Get trending activities from the last 30 days
 */
export async function getTrendingActivities(limit: number = 10): Promise<Array<{ keyword: string; count: number }>> {
  try {
    const { supabase } = await import('../lib/supabase');
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Query trending keywords
    const { data, error } = await supabase
      .from('post_keywords')
      .select('keyword')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (error) {
      console.error('Error fetching trending activities:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Count occurrences of each keyword
    const keywordCounts: Record<string, number> = {};
    data.forEach((row: any) => {
      const keyword = row.keyword.toLowerCase();
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    // Convert to array and sort by count
    const trending = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return trending;
  } catch (error) {
    console.error('Error in getTrendingActivities:', error);
    return [];
  }
}

/**
 * Check if an activity title matches trending keywords
 */
export function isActivityTrending(activityTitle: string, trendingKeywords: string[]): boolean {
  const lowerTitle = activityTitle.toLowerCase();
  return trendingKeywords.some(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
}

/**
 * Get trending score for an activity (higher = more trending)
 */
export function getActivityTrendingScore(
  activityTitle: string, 
  trending: Array<{ keyword: string; count: number }>
): number {
  const lowerTitle = activityTitle.toLowerCase();
  let score = 0;
  
  for (const item of trending) {
    if (lowerTitle.includes(item.keyword.toLowerCase())) {
      score += item.count;
    }
  }
  
  return score;
}

/**
 * Delete a post and its keywords from Supabase
 */
export async function deletePostFromSupabase(postId: string): Promise<boolean> {
  try {
    // Import project info
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Call server endpoint to delete post
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-db8b1db2/posts/${postId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting post from server:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Post deleted successfully from server:', result);
    return true;
  } catch (error) {
    console.error('Error in deletePostFromSupabase:', error);
    return false;
  }
}