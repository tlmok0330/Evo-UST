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

    // Build messages array
    const fullMessages = [
      {
        role: 'system',
        content: 'You are a helpful travel assistant for an eco-friendly travel app called Cathay Pacific Green Travel. Help users with travel planning, sustainable travel tips, and answering questions about eco-friendly travel options. Keep responses concise and practical.',
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

    console.log('Calling OpenRouter API...');
    console.log('Prompt length:', userMessage.length);

    // Call OpenRouter API
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
        max_tokens: 1000, // Increased for JSON responses
        temperature: 0.7,
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

    // Check for empty or whitespace-only responses
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('No response from AI model (empty or whitespace)');
      console.error('Full response:', JSON.stringify(data));
      return c.json({ 
        error: 'No response from AI model',
        fallback: true 
      }, 500);
    }

    console.log('AI response generated successfully');
    console.log('Response preview:', aiResponse.substring(0, 200));
    return c.json({ response: aiResponse });

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