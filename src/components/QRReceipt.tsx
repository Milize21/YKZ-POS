import React from 'react';
import QRCode from 'react-qr-code';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QRReceiptProps {
  value: string;
  label?: string;
  onClose?: () => void;
}

const QRReceipt: React.FC<QRReceiptProps> = ({ value, label, onClose }) => {
  return (
    <Card className="p-8 mt-4 w-full max-w-xl mx-auto shadow-xl">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white p-6 rounded-lg shadow-inner">
          <QRCode value={value} size={280} />
        </div>
        {label && (
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">Scan to view transaction details</p>
          </div>
        )}
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={() => navigator.clipboard?.writeText(value)}
            className="flex-1"
            size="lg"
          >
            Copy QR Data
          </Button>
          {onClose && (
            <Button 
              onClick={onClose}
              className="flex-1"
              size="lg"
              style={{ backgroundColor: '#2D3561' }}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QRReceipt;
