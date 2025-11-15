import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-db8b1db2`;

// Save user interests to Supabase
export async function saveUserInterests(userId: string, interests: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/user-interests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        interests,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to save user interests:', error);
      throw new Error('Failed to save interests');
    }

    console.log('User interests saved to Supabase:', interests);
  } catch (error) {
    console.error('Error saving user interests:', error);
    throw error;
  }
}

// Get user interests from Supabase
export async function getUserInterests(userId: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/user-interests/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No interests saved yet
        return [];
      }
      const error = await response.text();
      console.error('Failed to get user interests:', error);
      throw new Error('Failed to get interests');
    }

    const data = await response.json();
    return data.interests || [];
  } catch (error) {
    console.error('Error getting user interests:', error);
    return [];
  }
}
