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
  
  // Common activity keywords to look for
  const activityKeywords = [
    'hiking', 'cycling', 'biking', 'walking', 'temple', 'museum', 'beach', 'market',
    'food', 'restaurant', 'local', 'sustainable', 'eco', 'wildlife', 'nature',
    'park', 'garden', 'tour', 'adventure', 'cooking', 'yoga', 'meditation',
    'diving', 'snorkeling', 'kayaking', 'camping', 'volunteering', 'farm',
    'organic', 'vegan', 'vegetarian', 'cultural', 'heritage', 'traditional',
    'art', 'craft', 'workshop', 'spa', 'wellness', 'sunset', 'sunrise',
    'mountain', 'forest', 'river', 'lake', 'waterfall', 'village', 'city',
  ];
  
  // Convert to lowercase for matching
  const lowerCaption = caption.toLowerCase();
  
  // Find matching keywords in caption
  for (const keyword of activityKeywords) {
    if (lowerCaption.includes(keyword) && keywords.length < 3) {
      keywords.push(keyword);
    }
  }
  
  // Add keywords from eco actions if we need more
  if (keywords.length < 3) {
    const ecoKeywords = ecoActions.map(action => {
      // Extract key word from eco action
      if (action.toLowerCase().includes('transport')) return 'transport';
      if (action.toLowerCase().includes('bike') || action.toLowerCase().includes('cycl')) return 'cycling';
      if (action.toLowerCase().includes('reusable')) return 'reusable';
      if (action.toLowerCase().includes('food')) return 'local food';
      if (action.toLowerCase().includes('hotel')) return 'eco hotel';
      if (action.toLowerCase().includes('plastic')) return 'no plastic';
      return action.toLowerCase().split(' ')[0];
    });
    
    for (const keyword of ecoKeywords) {
      if (!keywords.includes(keyword) && keywords.length < 3) {
        keywords.push(keyword);
      }
    }
  }
  
  // If still not enough, add generic travel keywords
  const genericKeywords = ['sustainable travel', 'eco friendly', 'green living'];
  for (const keyword of genericKeywords) {
    if (keywords.length < 3) {
      keywords.push(keyword);
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