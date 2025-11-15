import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Send, Sparkles, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const examplePrompts = [
  "Plan a 5-day sustainable trip to Costa Rica",
  "I want an eco-friendly week in Japan",
  "Suggest eco-friendly activities in Paris"
];

export function AIChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callAIAPI = async (conversationMessages: Message[], onToken: (token: string) => void): Promise<string> => {
    try {
      // Get the last user message
      const lastUserMessage = conversationMessages[conversationMessages.length - 1];
      
      // Format conversation history (excluding the last message since we'll send it separately)
      const formattedHistory = conversationMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Build the server URL
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-db8b1db2/chat`;
      
      console.log('Calling server chat endpoint:', serverUrl);
      console.log('Request payload:', { 
        messages: formattedHistory, 
        userMessage: lastUserMessage.content 
      });

      // Call the server endpoint
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          messages: formattedHistory,
          userMessage: lastUserMessage.content,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log('Server response data:', data);
      
      const aiResponse = data.response;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Simulate token streaming for better UX
      const words = aiResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        onToken(words[i] + (i < words.length - 1 ? ' ' : ''));
      }

      return aiResponse;
    } catch (error: any) {
      console.error('AI API Error:', error);
      console.error('Error details:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Get AI response with all conversation history
      const conversationHistory = [...messages, userMessage];
      
      await callAIAPI(conversationHistory, (token) => {
        // Update the assistant message content as tokens arrive
        setMessages(prev => {
          return prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + token }
              : msg
          );
        });
      });

    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast.error(error.message || 'Failed to get response. Please try again.');
      
      // Update the assistant message with error content
      setMessages(prev => {
        return prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error processing your request. Please try again.' }
            : msg
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="tracking-wide">AI Travel Assistant</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Tell me where you'd like to go
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="text-xl mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground text-sm mb-6">Try asking something like:</p>
            
            <div className="space-y-3 w-full max-w-md">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-primary hover:shadow-sm transition-all"
                  disabled={isLoading}
                >
                  <p className="text-sm text-foreground">"{prompt}"</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-white border border-gray-200">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your dream trip..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-white"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}