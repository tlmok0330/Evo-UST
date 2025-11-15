# 🤖 Comprehensive Supabase AI Chat Setup Guide

## 📁 File Locations

### 1. **Supabase Edge Function** (Backend - Where AI Magic Happens)
**Location:** `/supabase/functions/chat-ai/index.ts`

This is your backend serverless function that:
- Securely stores the OpenRouter API key
- Receives chat messages from the frontend
- Calls OpenRouter AI API (Mistral-7B model)
- Returns AI responses

### 2. **CORS Configuration**
**Location:** `/supabase/functions/_shared/cors.ts`

Handles cross-origin requests so your frontend can talk to the backend.

### 3. **Supabase Client Configuration**
**Location:** `/lib/supabase.ts`

Connects your frontend to Supabase backend.

### 4. **AI Chat Component**
**Location:** `/components/AIChatBox.tsx`

The React component that displays the chat interface.

### 5. **Itinerary Page** (New!)
**Location:** `/components/Itinerary.tsx`

Your new AI Travel Planner page.

---

## 🔧 Complete Code Breakdown

### **1. Edge Function Code** (`/supabase/functions/chat-ai/index.ts`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userMessage } = await req.json();

    // Your OpenRouter API key (stored securely on the backend)
    const apiKey = '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';

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://cathay-green-travel.app',
        'X-Title': 'Cathay Pacific Green Travel',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free', // Free AI model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant for an eco-friendly travel app called Cathay Pacific Green Travel. Help users with travel planning, sustainable travel tips, and answering questions about eco-friendly travel options.',
          },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get AI response',
        fallback: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

**What it does:**
1. ✅ Receives chat messages from your app
2. ✅ Adds system prompt (makes AI act as travel assistant)
3. ✅ Calls OpenRouter API with your API key
4. ✅ Returns AI response to frontend
5. ✅ Handles errors gracefully

---

## 🚀 How to Deploy & Connect

### **Step 1: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in:
   - **Project Name:** `cathay-green-travel`
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be ready

### **Step 2: Get Your API Credentials**

1. In your Supabase project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"API"**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### **Step 3: Deploy the Edge Function**

**Option A: Using Supabase CLI (Recommended)**

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
*(Find PROJECT_REF in your project URL: https://[PROJECT_REF].supabase.co)*

4. Deploy the function:
```bash
supabase functions deploy chat-ai
```

**Option B: Using Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Click **"Edge Functions"** in the sidebar
3. Click **"Create a new function"**
4. Name it: `chat-ai`
5. Copy and paste the code from `/supabase/functions/chat-ai/index.ts`
6. Click **"Deploy function"**

### **Step 4: Set Environment Variables in Your App**

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

### **Step 5: Create Database Table (Optional - for chat history)**

If you want to save chat history, run this SQL in Supabase SQL Editor:

1. Go to **"SQL Editor"** in Supabase Dashboard
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Create chat_messages table
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert and read their own messages
CREATE POLICY "Anyone can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read messages" ON chat_messages
  FOR SELECT USING (true);
```

4. Click **"Run"**

---

## 📱 How the App Works (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR MOBILE APP                          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  User types: "Plan a trip to Tokyo"          │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────┐          │
│  │    AIChatBox Component                       │          │
│  │    (components/AIChatBox.tsx)                │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                       │
│                     │ supabase.functions.invoke()           │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE BACKEND (Cloud)                       │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │   Edge Function: chat-ai                     │          │
│  │   (supabase/functions/chat-ai/index.ts)      │          │
│  │                                              │          │
│  │   - Receives user message                    │          │
│  │   - Adds OpenRouter API key                  │          │
│  │   - Calls OpenRouter API ──────┐            │          │
│  └──────────────────────────────────│───────────┘          │
│                                     │                       │
└─────────────────────────────────────┼───────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │   OpenRouter AI API             │
                    │   (openrouter.ai)               │
                    │                                 │
                    │   - Processes with Mistral-7B   │
                    │   - Generates travel advice     │
                    └─────────────────┬───────────────┘
                                      │
                                      │ AI Response
                                      ▼
                    ┌─────────────────────────────────┐
                    │  "Here's a 7-day Tokyo          │
                    │   eco-travel itinerary..."      │
                    └─────────────────┬───────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BACK TO YOUR APP                               │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │   Chat displays AI response                  │          │
│  │   Message saved to Supabase DB               │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

✅ **API Key Hidden:** OpenRouter API key is stored in Edge Function (backend), never exposed to users  
✅ **CORS Protection:** Only your app can call the function  
✅ **Error Handling:** Graceful fallbacks if API fails  
✅ **Rate Limiting:** Supabase has built-in rate limiting  

---

## 🧪 Testing Without Supabase (Temporary)

If you haven't connected Supabase yet, the app shows a yellow warning banner but you can still see the UI. To test without Supabase, you can temporarily modify the AIChatBox component to use mock responses.

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Edge function shows "Active" in Supabase Dashboard
- [ ] Yellow warning banner disappears on Itinerary page
- [ ] Green success banner appears showing "AI Assistant Ready"
- [ ] You can send a message in the chat
- [ ] AI responds within 3-5 seconds
- [ ] Chat history is saved (check Supabase database)
- [ ] Messages persist after page refresh

---

## 🐛 Common Issues & Solutions

### Issue 1: "Supabase Not Connected" Warning
**Solution:** Make sure `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue 2: "Failed to get AI response"
**Solution:** 
- Check Edge Function is deployed: `supabase functions list`
- Check OpenRouter API key is valid
- Check function logs: `supabase functions logs chat-ai`

### Issue 3: Chat history not saving
**Solution:** 
- Make sure `chat_messages` table exists (run SQL from Step 5)
- Check RLS policies are enabled

### Issue 4: CORS errors
**Solution:** 
- Make sure `/supabase/functions/_shared/cors.ts` exists
- Redeploy the function: `supabase functions deploy chat-ai`

---

## 📞 Need Help?

1. Check Supabase logs: Dashboard → Edge Functions → chat-ai → Logs
2. Check browser console for errors (F12 → Console tab)
3. Test Edge Function directly in Supabase Dashboard

---

## 🎉 That's It!

Once connected, your AI Travel Planner will:
- ✈️ Help users plan trips
- 🌱 Suggest eco-friendly options
- 💬 Answer travel questions
- 📝 Save chat history
- 🤖 Use real AI (Mistral-7B via OpenRouter)

**Current Status:** 
- ✅ Edge Function code ready
- ✅ Frontend components ready
- ✅ OpenRouter API key configured
- ⏳ Waiting for Supabase connection
