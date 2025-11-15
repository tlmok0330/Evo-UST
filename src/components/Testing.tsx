import { AIChatBox } from './AIChatBox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle2 } from 'lucide-react';
import { DatabaseTestPanel } from './DatabaseTestPanel';

export function Testing() {
  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-primary text-primary-foreground p-6 rounded-lg shadow-md">
          <h1 className="tracking-wide">Testing & AI Assistant</h1>
          <p className="text-sm opacity-90 mt-1">
            Chat with our AI travel assistant and test app features
          </p>
        </div>

        {/* Database Connection Test */}
        <DatabaseTestPanel />

        {/* Supabase Connection Status */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">AI Assistant Ready</AlertTitle>
          <AlertDescription className="text-green-700">
            Your AI chat is powered by OpenRouter API (Mistral 7B) through Supabase Edge Functions.
          </AlertDescription>
        </Alert>

        <AIChatBox />
      </div>
    </div>
  );
}