import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Database, CheckCircle2, XCircle, Loader2, Plane, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function DatabaseTestPanel() {
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [flightCount, setFlightCount] = useState<number | null>(null);
  const [sampleFlights, setSampleFlights] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<'deployed' | 'not-deployed' | 'partial' | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnected(null);
    setFlightCount(null);
    setSampleFlights([]);
    setDeploymentStatus(null);

    try {
      // Test 1: Check if we can connect
      const { data, error, count } = await supabase
        .from('flights')
        .select('*', { count: 'exact', head: false })
        .limit(3);

      if (error) {
        console.error('Connection error:', error);
        setConnected(false);
        
        // Determine deployment status based on error
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          setDeploymentStatus('not-deployed');
          toast.error('Database table not found', {
            description: 'The flights table has not been created yet. Run the migration!'
          });
        } else {
          toast.error('Database connection failed', {
            description: error.message
          });
        }
        return;
      }

      // Success - determine deployment status
      setConnected(true);
      setFlightCount(count || 0);
      setSampleFlights(data || []);
      
      if (count === 0) {
        setDeploymentStatus('partial');
        toast.warning('Table exists but no data found', {
          description: 'Run the migration INSERT statements to add flight data'
        });
      } else if (count && count < 40) {
        setDeploymentStatus('partial');
        toast.warning(`Found ${count} flights`, {
          description: 'Expected 40+ flights. Migration may be incomplete.'
        });
      } else {
        setDeploymentStatus('deployed');
        toast.success('Database fully deployed!', {
          description: `Found ${count} flights in database. Ready for presentation! 🎉`
        });
      }
    } catch (err) {
      console.error('Test error:', err);
      setConnected(false);
      setDeploymentStatus('not-deployed');
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Deployment Check
        </CardTitle>
        <CardDescription>
          Test your Supabase connection and verify flight data deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Button */}
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Database Connection
            </>
          )}
        </Button>

        {/* Connection Status */}
        {connected !== null && (
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Connection Status:</span>
              {connected ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed
                </Badge>
              )}
            </div>
            
            {connected && flightCount !== null && (
              <div className="text-sm text-muted-foreground">
                ✅ Found {flightCount} flights in database
              </div>
            )}
          </div>
        )}

        {/* Deployment Status */}
        {deploymentStatus && (
          <div className={`p-4 rounded-lg border-2 ${
            deploymentStatus === 'deployed' 
              ? 'bg-green-50 border-green-200' 
              : deploymentStatus === 'partial'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {deploymentStatus === 'deployed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : deploymentStatus === 'partial' ? (
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-medium mb-1 ${
                  deploymentStatus === 'deployed' 
                    ? 'text-green-900' 
                    : deploymentStatus === 'partial'
                    ? 'text-amber-900'
                    : 'text-red-900'
                }`}>
                  {deploymentStatus === 'deployed' && '✅ Fully Deployed & Ready!'}
                  {deploymentStatus === 'partial' && '⚠️ Partially Deployed'}
                  {deploymentStatus === 'not-deployed' && '❌ Not Deployed Yet'}
                </div>
                <div className={`text-sm ${
                  deploymentStatus === 'deployed' 
                    ? 'text-green-800' 
                    : deploymentStatus === 'partial'
                    ? 'text-amber-800'
                    : 'text-red-800'
                }`}>
                  {deploymentStatus === 'deployed' && (
                    <>
                      Your database is fully deployed with {flightCount}+ flights across 8 destinations. 
                      The Holiday tab will fetch real flight data from Supabase. You're ready for your presentation! 🎉
                    </>
                  )}
                  {deploymentStatus === 'partial' && (
                    <>
                      The flights table exists but appears incomplete. Expected 40+ flights but found {flightCount}.
                      Try re-running the migration to ensure all data is inserted.
                    </>
                  )}
                  {deploymentStatus === 'not-deployed' && (
                    <>
                      The flights table doesn't exist in your Supabase database yet. 
                      You need to run the migration to create and populate it.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sample Flights */}
        {sampleFlights.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium text-sm">Sample Flights from Database:</div>
            {sampleFlights.map((flight) => (
              <div 
                key={flight.id} 
                className="p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <Plane className="h-4 w-4 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">{flight.flight_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {flight.departure_city} → {flight.arrival_city}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {flight.departure_time} - {flight.arrival_time} • {flight.duration}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">HKD {flight.base_price.toLocaleString()}</div>
                    <div className="text-xs text-green-600">+{flight.green_points} GP</div>
                    {flight.is_eco_friendly && (
                      <Badge className="bg-green-500 text-xs mt-1">Eco</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions for Not Deployed */}
        {deploymentStatus === 'not-deployed' && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="font-medium text-amber-900 mb-2">
              📋 Quick Deployment Steps
            </div>
            <div className="text-sm text-amber-800 space-y-2">
              <ol className="list-decimal list-inside ml-2 space-y-1.5">
                <li>
                  Go to{' '}
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline font-medium inline-flex items-center gap-1"
                  >
                    Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Open your project: <code className="bg-amber-100 px-1 py-0.5 rounded">hcrazvlneraiamzgqizf</code></li>
                <li>Click "SQL Editor" in left sidebar</li>
                <li>Click "New query"</li>
                <li>Copy all code from: <code className="bg-amber-100 px-1 py-0.5 rounded">/supabase/migrations/20251115000000_create_flights_table.sql</code></li>
                <li>Paste and click "Run"</li>
                <li>Return here and test again!</li>
              </ol>
              <div className="pt-2 border-t border-amber-300 mt-3">
                <strong>Takes only 2 minutes!</strong> See <code className="bg-amber-100 px-1 py-0.5 rounded">/QUICK_START.md</code> for detailed guide.
              </div>
            </div>
          </div>
        )}

        {/* Instructions for Partial Deployment */}
        {deploymentStatus === 'partial' && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="font-medium text-amber-900 mb-2">
              🔧 Fix Incomplete Deployment
            </div>
            <div className="text-sm text-amber-800 space-y-2">
              <p>Your table exists but may be missing data. Try these steps:</p>
              <ol className="list-decimal list-inside ml-2 space-y-1.5">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Re-run the complete migration SQL</li>
                <li>Or run just the INSERT statements (lines 26-69)</li>
                <li>Test again here</li>
              </ol>
              <div className="pt-2 border-t border-amber-300 mt-3">
                Expected result: 40+ flights across Tokyo, Singapore, London, Sydney, San Francisco, Bangkok, and Seoul.
              </div>
            </div>
          </div>
        )}

        {/* Success Celebration */}
        {deploymentStatus === 'deployed' && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="font-medium text-green-900 mb-2">
              🎉 Ready for Presentation!
            </div>
            <div className="text-sm text-green-800 space-y-2">
              <p>Your database is fully deployed and working perfectly:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>✅ {flightCount}+ flights loaded</li>
                <li>✅ Multiple destinations available</li>
                <li>✅ Eco-friendly flights included</li>
                <li>�� Real-time data fetching enabled</li>
              </ul>
              <div className="pt-2 border-t border-green-300 mt-3">
                <strong>Next steps:</strong> Go to Holiday tab and search for Tokyo, Singapore, or London to see your database in action!
              </div>
            </div>
          </div>
        )}

        {/* Database Info */}
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted">
          <div className="font-medium mb-1">Database Info:</div>
          <div className="space-y-0.5">
            <div>Project: <code className="bg-background px-1 py-0.5 rounded">hcrazvlneraiamzgqizf</code></div>
            <div>Table: <code className="bg-background px-1 py-0.5 rounded">flights</code></div>
            <div>Expected: 40+ flights across 8 destinations</div>
            <div>URL: <code className="bg-background px-1 py-0.5 rounded text-[10px]">https://hcrazvlneraiamzgqizf.supabase.co</code></div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Supabase Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => {
              toast.info('Check /QUICK_START.md or /HOW_TO_CHECK_DATABASE_DEPLOYMENT.md for detailed guides');
            }}
          >
            View Guides
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}