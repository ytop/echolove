import React from 'react';
import { HeartPulse, Heart, ShieldCheck } from 'lucide-react';

interface DonationModalProps {
  onClose: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#6B5E4C]/30 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative bg-[#FFFEFA] rounded-[3rem] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_-16px_rgba(107,94,76,0.15)] transform transition-all border border-white">
        <div className="bg-[#C9B081] h-2.5 w-full"></div>
        
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-[#C9B081] mx-auto mb-8 shadow-sm border border-[#F2EEE6]">
            <HeartPulse className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#6B5E4C] mb-3">Keep the Resonance Alive</h2>
          <p className="text-sm text-[#9E8A6B] leading-relaxed mb-10 px-6 font-medium">
            Your gentle support helps us maintain this peaceful bridge, keeping hearts connected across the distance.
          </p>
          
          <div className="grid grid-cols-3 gap-5 mb-10">
            {[9, 29, 99].map(amount => (
              <button 
                key={amount}
                className="py-4 px-4 bg-white border border-[#F2EEE6] rounded-2xl hover:border-[#C9B081] hover:bg-[#FFFCEB] hover:text-[#9E8A6B] font-bold transition-all text-[#6B5E4C] shadow-sm active:scale-95"
              >
                ${amount}
              </button>
            ))}
          </div>
          
          <button 
            className="w-full py-5 bg-[#9E8A6B] text-white rounded-[2rem] font-bold hover:bg-[#857458] transition-all shadow-lg shadow-[#C9B081]/10 mb-6 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Support with Kindness
            <Heart className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            onClick={onClose}
            className="text-[11px] font-bold text-[#BDB2A3] hover:text-[#9E8A6B] uppercase tracking-[0.25em] transition-colors"
          >
            Return to quiet
          </button>
        </div>

        <div className="bg-[#FAF8F3] p-6 border-t border-[#F2EEE6] flex items-center justify-center gap-3 text-[#BDB2A3] uppercase tracking-widest text-[10px] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Payments</span>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
