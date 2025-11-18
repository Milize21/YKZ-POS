// Email notification system for sales transactions
interface TransactionEmail {
  id: string;
  type: 'success' | 'failed' | 'cancelled';
  transaction: any;
  timestamp: string;
  attempts: number;
}

class EmailNotificationService {
  private queue: TransactionEmail[] = [];
  private readonly QUEUE_KEY = 'yorukaze_email_queue';
  private readonly API_ENDPOINT = '/api/send-transaction-email';
  private isProcessing = false;
  private checkInterval: number | null = null;

  constructor() {
    this.loadQueue();
    this.startQueueProcessor();
  }

  // Load pending emails from localStorage
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load email queue:', error);
      this.queue = [];
    }
  }

  // Save queue to localStorage
  private saveQueue(): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save email queue:', error);
    }
  }

  // Add transaction to email queue
  public queueTransactionEmail(
    type: 'success' | 'failed' | 'cancelled',
    transaction: any
  ): void {
    const email: TransactionEmail = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      transaction,
      timestamp: new Date().toISOString(),
      attempts: 0,
    };

    this.queue.push(email);
    this.saveQueue();

    console.log(`📧 Queued ${type} transaction email:`, email.id);

    // Try to send immediately
    this.processQueue();
  }

  // Check internet connectivity
  private async checkInternetConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Send email via API
  private async sendEmail(email: TransactionEmail): Promise<boolean> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'yorukazeproduction@gmail.com',
          type: email.type,
          transaction: email.transaction,
          timestamp: email.timestamp,
        }),
      });

      if (response.ok) {
        console.log(`✅ Email sent successfully:`, email.id);
        return true;
      } else {
        console.error(`❌ Failed to send email:`, await response.text());
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending email:`, error);
      return false;
    }
  }

  // Process email queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Check internet connection
      const hasInternet = await this.checkInternetConnection();

      if (!hasInternet) {
        console.log('📡 No internet connection. Emails will be sent when online.');
        this.isProcessing = false;
        return;
      }

      // Process emails one by one
      const emailsToRemove: string[] = [];

      for (const email of this.queue) {
        email.attempts++;

        const success = await this.sendEmail(email);

        if (success) {
          emailsToRemove.push(email.id);
        } else if (email.attempts >= 5) {
          // Remove after 5 failed attempts
          console.error(`❌ Giving up on email after 5 attempts:`, email.id);
          emailsToRemove.push(email.id);
        }

        // Add delay between emails
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Remove successfully sent or failed emails
      this.queue = this.queue.filter((e) => !emailsToRemove.includes(e.id));
      this.saveQueue();

      console.log(`📧 Email queue processed. Remaining: ${this.queue.length}`);
    } catch (error) {
      console.error('Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Start periodic queue processor
  private startQueueProcessor(): void {
    // Check queue every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.processQueue();
    }, 30000);

    // Also check when window gains focus (user comes back online)
    window.addEventListener('focus', () => {
      this.processQueue();
    });

    // Check when online event fires
    window.addEventListener('online', () => {
      console.log('📡 Internet connection restored. Processing email queue...');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Internet connection lost. Emails will queue until online.');
    });
  }

  // Stop queue processor (cleanup)
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Get queue status
  public getQueueStatus(): { pending: number; emails: TransactionEmail[] } {
    return {
      pending: this.queue.length,
      emails: [...this.queue],
    };
  }

  // Manual retry
  public retryQueue(): void {
    console.log('🔄 Manually retrying email queue...');
    this.processQueue();
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();

// Helper functions for easy usage
export function notifySuccessfulSale(transaction: any): void {
  emailNotificationService.queueTransactionEmail('success', transaction);
}

export function notifyFailedSale(transaction: any): void {
  emailNotificationService.queueTransactionEmail('failed', transaction);
}

export function notifyCancelledSale(transaction: any): void {
  emailNotificationService.queueTransactionEmail('cancelled', transaction);
}

export function getEmailQueueStatus() {
  return emailNotificationService.getQueueStatus();
}

export function retryEmailQueue() {
  emailNotificationService.retryQueue();
}
