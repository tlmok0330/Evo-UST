import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
// @ts-ignore
import * as kv from "./kv_store.tsx";
import userInterestsApp from "./user_interests.tsx";
import { getFlightProvider } from "./flightService.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db8b1db2/health", (c) => {
  return c.json({ status: "ok" });
});

// AI Chat endpoint
app.post("/make-server-db8b1db2/chat", async (c) => {
  try {
    const { messages, userMessage } = await c.req.json();

    // Get API key from environment variable (SECURE)
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not set in environment');
      return c.json({ 
        error: 'API key not configured',
        fallback: true 
      }, 500);
    }

    // Validate input
    if (!userMessage || typeof userMessage !== 'string') {
      return c.json({ error: 'userMessage is required' }, 400);
    }

    // Build messages array with more explicit system prompt
    const fullMessages = [
      {
        role: 'system',
        content: 'You are a travel activity suggestion assistant. You MUST respond with valid JSON only, no other text. Generate activity suggestions in this exact format:\n[{"title":"Activity Name","time":"HH:MM","location":"Location","description":"Brief description","partnerName":"Partner Company Name","isEcoFriendly":true,"matchingInterests":["Interest1","Interest2"]}]\n\nIMPORTANT: Output ONLY the JSON array, nothing else. No explanations, no markdown, just the raw JSON array.',
      },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('Calling OpenRouter API with Mistral 7B...');
    console.log('Prompt length:', userMessage.length);

    // Call OpenRouter API with Mistral 7B
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.cathaypacific.com/cx/en_HK.html',
        'X-Title': 'Cathay Pacific Green Travel',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: fullMessages,
        max_tokens: 2000, // Increased for JSON responses
        temperature: 0.3, // Lower temperature for more consistent JSON output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      return c.json({ 
        error: `OpenRouter API Error: ${response.status}`,
        details: errorText,
        fallback: true 
      }, 500);
    }

    const data = await response.json();
    console.log('OpenRouter response received:', JSON.stringify(data).substring(0, 200));
    
    const aiResponse = data.choices?.[0]?.message?.content;

    // Aggressive validation for empty/whitespace responses
    if (!aiResponse || !aiResponse.trim() || aiResponse.trim().length < 10) {
      console.error('Empty or too short response from AI model');
      console.error('AI response:', aiResponse);
      console.error('Full API response:', JSON.stringify(data));
      return c.json({ 
        error: 'Empty response from AI model',
        fallback: true 
      }, 500);
    }

    // Clean the response aggressively
    const cleanedResponse = aiResponse.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/^\s*\[B_INST\][\s\S]*?\[\/B_INST\]\s*/g, '')
      .replace(/<\/?s>/g, '')
      .trim();

    // Ensure we have actual content
    if (cleanedResponse.length < 10 || !cleanedResponse.includes('{')) {
      console.error('Invalid response format from AI model');
      console.error('Cleaned response:', cleanedResponse);
      return c.json({ 
        error: 'Invalid response format - no JSON structure found',
        fallback: true 
      }, 500);
    }

    // Try to parse as JSON to validate before sending to frontend
    try {
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('✅ Valid JSON response from Mistral 7B');
          console.log('Response preview:', cleanedResponse.substring(0, 200));
          return c.json({ response: cleanedResponse });
        } else {
          console.error('Parsed JSON but array is empty');
          return c.json({ 
            error: 'AI returned empty array',
            fallback: true 
          }, 500);
        }
      }
      
      // If no array match, try parsing the whole thing
      const parsed = JSON.parse(cleanedResponse);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Valid JSON response from Mistral 7B');
        return c.json({ response: cleanedResponse });
      }
      
      console.error('Parsed JSON but invalid structure (not array or empty)');
      return c.json({ 
        error: 'Invalid JSON structure',
        fallback: true 
      }, 500);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message);
      console.error('Attempted to parse:', cleanedResponse);
      return c.json({ 
        error: `Parse error: ${parseError.message}`,
        fallback: true 
      }, 500);
    }

  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return c.json({ 
      error: error.message || 'Failed to get AI response',
      fallback: true 
    }, 500);
  }
});

// Mount user interests routes
app.route('/', userInterestsApp);

// Delete community post endpoint
app.delete("/make-server-db8b1db2/posts/:postId", async (c) => {
  try {
    const postId = c.req.param('postId');
    
    if (!postId) {
      return c.json({ error: 'Post ID is required' }, 400);
    }

    console.log('Deleting post:', postId);

    // Create Supabase client with service role key for admin access
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return c.json({ error: 'Database not configured' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete keywords first (foreign key constraint)
    const { error: keywordsError } = await supabase
      .from('post_keywords')
      .delete()
      .eq('post_id', postId);

    if (keywordsError) {
      console.error('Error deleting keywords:', keywordsError);
      // Continue anyway, post might not have keywords
    }

    // Delete post
    const { error: postError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (postError) {
      console.error('Error deleting post:', postError);
      return c.json({ 
        error: 'Failed to delete post from database',
        details: postError.message 
      }, 500);
    }

    console.log('Post deleted successfully:', postId);
    return c.json({ success: true, message: 'Post deleted successfully' });

  } catch (error: any) {
    console.error('Error in delete post endpoint:', error);
    return c.json({ 
      error: error.message || 'Failed to delete post',
    }, 500);
  }
});

// Clear all community posts and keywords (testing endpoint)
app.delete("/make-server-db8b1db2/posts-clear-all", async (c) => {
  try {
    console.log('Clearing all community posts and keywords...');

    // Create Supabase client with service role key for admin access
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return c.json({ error: 'Database not configured' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete all keywords first (foreign key constraint)
    const { error: keywordsError } = await supabase
      .from('post_keywords')
      .delete()
      .neq('post_id', ''); // Delete all rows

    if (keywordsError) {
      console.error('Error deleting all keywords:', keywordsError);
      return c.json({ 
        error: 'Failed to delete keywords from database',
        details: keywordsError.message 
      }, 500);
    }

    // Delete all posts
    const { error: postsError } = await supabase
      .from('community_posts')
      .delete()
      .neq('id', ''); // Delete all rows

    if (postsError) {
      console.error('Error deleting all posts:', postsError);
      return c.json({ 
        error: 'Failed to delete posts from database',
        details: postsError.message 
      }, 500);
    }

    console.log('All posts and keywords cleared successfully');
    return c.json({ success: true, message: 'All posts and keywords cleared successfully' });

  } catch (error: any) {
    console.error('Error in clear all posts endpoint:', error);
    return c.json({ 
      error: error.message || 'Failed to clear posts',
    }, 500);
  }
});

// Flight search endpoint
app.post("/make-server-db8b1db2/flights/search", async (c) => {
  try {
    const searchRequest = await c.req.json();

    console.log('Flight search request:', JSON.stringify(searchRequest));

    // Validate required fields
    if (!searchRequest.origin || !searchRequest.destination) {
      return c.json({ error: 'Origin and destination are required' }, 400);
    }
    if (!searchRequest.departureDate) {
      return c.json({ error: 'Departure date is required' }, 400);
    }
    if (!searchRequest.adults || searchRequest.adults < 1) {
      return c.json({ error: 'At least one adult passenger is required' }, 400);
    }

    // Default values
    searchRequest.children = searchRequest.children || 0;
    searchRequest.infants = searchRequest.infants || 0;
    searchRequest.cabinClass = searchRequest.cabinClass || 'economy';

    // Get flight provider (simulation or real API)
    const flightProvider = getFlightProvider();

    // Search flights
    console.log('Searching flights...');
    const results = await flightProvider.searchFlights(searchRequest);

    console.log(`Found ${results.data.length} flights`);
    return c.json(results);

  } catch (error: any) {
    console.error('Error in flight search endpoint:', error);
    return c.json({ 
      error: error.message || 'Failed to search flights',
      details: error.stack,
    }, 500);
  }
});

Deno.serve(app.fetch);