import { Hono } from 'npm:hono@4';

import * as kv from './kv_store.tsx';

const app = new Hono();

// Save user interests
app.post('/make-server-db8b1db2/user-interests', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, interests } = body;

    if (!userId || !Array.isArray(interests)) {
      return c.json({ error: 'Invalid request: userId and interests array required' }, 400);
    }

    // Store in KV store with key pattern: user_interests_{userId}
    const key = `user_interests_${userId}`;
    await kv.set(key, { interests, updatedAt: new Date().toISOString() });

    console.log(`Saved interests for user ${userId}:`, interests);

    return c.json({ success: true, message: 'Interests saved successfully' });
  } catch (error) {
    console.error('Error saving user interests:', error);
    return c.json({ error: 'Failed to save interests', details: error.message }, 500);
  }
});

// Get user interests
app.get('/make-server-db8b1db2/user-interests/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const key = `user_interests_${userId}`;
    const data = await kv.get(key);

    if (!data) {
      return c.json({ error: 'No interests found' }, 404);
    }

    console.log(`Retrieved interests for user ${userId}:`, data.interests);

    return c.json({ interests: data.interests, updatedAt: data.updatedAt });
  } catch (error) {
    console.error('Error getting user interests:', error);
    return c.json({ error: 'Failed to get interests', details: error.message }, 500);
  }
});

export default app;
