import React from 'react';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QRReceiptProps {
  value: string;
  customerName?: string;
  customerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRReceipt: React.FC<QRReceiptProps> = ({ 
  value, 
  customerName = "AURELIO DARREN SAVERO, DIGITAL & KREATIF",
  customerId = "ID1025453710606",
  isOpen, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0 bg-white overflow-hidden border-0">
        <div className="relative w-full">
          {/* QRIS Template Image */}
          <img 
            src="/Qris2YKZ.png" 
            alt="QRIS Template" 
            className="w-full h-auto"
          />

          {/* Close button */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white border-2 border-gray-300 shadow-lg z-50"
            variant="ghost"
          >
            <X className="h-5 w-5 text-black" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRReceipt;
