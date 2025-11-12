import React from 'react';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
      <DialogContent className="max-w-2xl p-0 bg-white overflow-hidden border-0">
        <div className="relative w-full h-full">
          {/* Header with QRIS Logo and GPN Logo */}
          <div className="flex justify-between items-start p-8 pb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black tracking-tighter">
                <span className="inline-block border-4 border-black px-2 py-1">QRIS</span>
              </div>
              <div className="text-xs font-semibold text-black">
                <div>QR Code Standar</div>
                <div>Pembayaran Nasional</div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M50 10 L70 30 L70 50 L90 70 L70 90 L50 70 L30 90 L10 70 L30 50 L30 30 Z" fill="#DC2626" />
                </svg>
              </div>
              <div className="text-xl font-black mt-1">GPN</div>
            </div>
          </div>

          {/* Customer Name */}
          <div className="text-center px-8">
            <h2 className="text-2xl font-black text-black tracking-tight">
              {customerName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">NMID: {customerId}</p>
          </div>

          {/* Transaction ID */}
          <div className="text-center mt-4">
            <p className="text-base font-bold text-black">A01</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center px-8 py-6">
            <div className="bg-white p-6 rounded-lg border-4 border-gray-200">
              <QRCode value={value} size={320} level="H" />
            </div>
          </div>

          {/* "SATU QRIS UNTUK SEMUA" Text */}
          <div className="text-center px-8 pb-4">
            <p className="text-xl font-black text-black">SATU QRIS UNTUK SEMUA</p>
            <p className="text-sm text-gray-700 mt-2">Cek aplikasi penyelenggara</p>
            <p className="text-sm text-gray-700">di: www.aspi-qris.id</p>
          </div>

          {/* Footer with Diagonal Red Design */}
          <div className="relative bg-gray-50 p-6 mt-4">
            {/* Red diagonal shape - left */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-32 bg-red-600"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0 100%)'
              }}
            />
            
            {/* Red diagonal shape - right */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-48 bg-red-600"
              style={{
                clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
              }}
            />

            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="text-black">
                <p className="font-semibold">Dicetak oleh: 93600914</p>
                <p className="mt-1">Versi cetak: v0.0.2025.11.12</p>
              </div>
              
              <div className="flex gap-6 items-center text-white">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="4" width="16" height="16" stroke="#DC2626" strokeWidth="2"/>
                      <rect x="8" y="8" width="8" height="8" fill="#DC2626"/>
                    </svg>
                  </div>
                  <p className="text-[10px] font-semibold">Buka Aplikasi</p>
                  <p className="text-[10px] font-semibold">Berlogo QRIS</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4L12 14M12 14L8 10M12 14L16 10" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                      <rect x="6" y="16" width="12" height="4" stroke="#DC2626" strokeWidth="2"/>
                    </svg>
                  </div>
                  <p className="text-[10px] font-semibold">Scan dan cek</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-1">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="8" width="16" height="10" rx="2" stroke="#DC2626" strokeWidth="2"/>
                      <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="#DC2626" strokeWidth="2"/>
                      <circle cx="12" cy="13" r="2" fill="#DC2626"/>
                    </svg>
                  </div>
                  <p className="text-[10px] font-semibold">Bayar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full w-10 h-10 p-0 bg-black/10 hover:bg-black/20 border-0"
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
