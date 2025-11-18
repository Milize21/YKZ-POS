import { getEmailQueueStatus, retryEmailQueue } from '@/lib/emailNotification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function EmailQueueStatus() {
  const [status, setStatus] = useState(getEmailQueueStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setStatus(getEmailQueueStatus());
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    retryEmailQueue();
    setTimeout(() => setStatus(getEmailQueueStatus()), 1000);
  };

  if (status.pending === 0) {
    return null; // Don't show if no pending emails
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-sm">Email Queue</h3>
            <p className="text-xs text-muted-foreground">
              {status.pending} email{status.pending !== 1 ? 's' : ''} pending
              {!isOnline && ' (Offline - Will send when online)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {isOnline ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry Now
          </Button>
        </div>
      </div>

      {status.emails.length > 0 && (
        <div className="mt-3 space-y-1">
          {status.emails.slice(0, 3).map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between text-xs bg-white p-2 rounded"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{email.type.toUpperCase()}</span>
                <span className="text-muted-foreground">
                  {new Date(email.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Attempts: {email.attempts}
              </Badge>
            </div>
          ))}
          {status.emails.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{status.emails.length - 3} more
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
