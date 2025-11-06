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
    <Card className="p-4 mt-4 w-full">
      <div className="flex flex-col items-center gap-4">
        <QRCode value={value} size={160} />
        {label && <p className="text-sm text-muted-foreground text-center">{label}</p>}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigator.clipboard?.writeText(value)}>
            Copy QR Data
          </Button>
          {onClose && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QRReceipt;
