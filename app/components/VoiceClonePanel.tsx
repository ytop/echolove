import React, { useRef, useState } from 'react';
import type { VoiceSample } from '../types';

interface VoiceClonePanelProps {
  samples: VoiceSample[];
  addSample: (sample: VoiceSample) => void;
  removeSample: (id: string) => void;
  persona: string;
  setPersona: (val: string) => void;
}

const VoiceClonePanel: React.FC<VoiceClonePanelProps> = ({ 
  samples, 
  addSample, 
  removeSample, 
  persona, 
  setPersona 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const newSample: VoiceSample = {
        id: Date.now().toString(),
        name: file.name,
        blob: file,
        base64: base64,
        duration: 0
      };
      addSample(newSample);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmDelete = () => {
    if (deletingId) {
      removeSample(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 relative bg-[#FDFBF7]">
      <div className="mb-10">
        <h2 className="text-[11px] font-bold text-[#9E8A6B] uppercase tracking-[0.2em] mb-6">Emulation Profile</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-[#BDB2A3] mb-2 block uppercase tracking-wider">Soul & Character</span>
            <textarea 
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Tell us about their warm personality, their favorite stories, or how they used to laugh..."
              className="w-full p-4 bg-white border border-[#F2EEE6] rounded-[1.5rem] text-sm h-36 resize-none focus:ring-2 focus:ring-[#FFFCEB] outline-none transition-all placeholder:text-[#D6CFB3] shadow-sm leading-relaxed"
            />
          </label>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-bold text-[#9E8A6B] uppercase tracking-[0.2em]">Voice Prints</h2>
          <span className="text-[10px] font-bold bg-[#FFFCEB] text-[#9E8A6B] px-3 py-1 rounded-full border border-[#F9F5DE]">
            {samples.length} Clips
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mb-8 space-y-3 pr-1">
          {samples.length === 0 ? (
            <div className="bg-white/50 border-2 border-dashed border-[#F2EEE6] rounded-3xl p-8 text-center">
              <i className="fa-solid fa-feather-pointed text-[#F2EEE6] text-3xl mb-3"></i>
              <p className="text-xs text-[#BDB2A3] font-bold tracking-wide">Waiting for a voice...</p>
            </div>
          ) : (
            samples.map(sample => (
              <div 
                key={sample.id} 
                className="group flex items-center justify-between p-4 bg-white border border-[#F2EEE6] rounded-2xl hover:border-[#C9B081] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#C9B081] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#F2EEE6]">
                    <i className="fa-solid fa-volume-high text-sm"></i>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-bold text-[#6B5E4C] truncate">{sample.name}</p>
                    <p className="text-[9px] text-[#BDB2A3] uppercase font-bold tracking-tighter">Echo Captured</p>
                  </div>
                </div>
                <button 
                  onClick={() => setDeletingId(sample.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#D6CFB3] hover:text-[#C9B081] transition-all"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden" 
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 bg-[#9E8A6B] text-white rounded-[1.5rem] font-bold text-sm hover:bg-[#857458] transition-all flex items-center justify-center gap-3 shadow-sm transform active:scale-[0.98]"
        >
          <i className="fa-solid fa-plus-circle text-lg"></i>
          Add New Voice
        </button>
      </div>

      <div className="mt-auto pt-8 border-t border-[#F2EEE6]">
        <div className="bg-[#FFFCEB]/50 p-5 rounded-3xl border border-[#F9F5DE]">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-[#C9B081]">
              <i className="fa-solid fa-star text-sm"></i>
            </div>
            <p className="text-[11px] leading-relaxed text-[#9E8A6B] font-bold">
              Voices are treated with the softest care. Each sample helps us build a more beautiful resonance.
            </p>
          </div>
        </div>
      </div>

      {deletingId && (
        <div className="absolute inset-0 z-20 bg-[#FDFBF7]/95 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#C9B081] mb-6 shadow-sm border border-[#F2EEE6]">
            <i className="fa-solid fa-trash-can text-xl"></i>
          </div>
          <h3 className="text-base font-bold text-[#6B5E4C] mb-2">Remove this memory?</h3>
          <p className="text-xs text-[#9E8A6B] leading-relaxed mb-8 px-4 font-medium">
            This voice sample will be removed. This cannot be undone.
          </p>
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={confirmDelete}
              className="w-full py-3 bg-[#C9B081] text-white rounded-2xl font-bold text-xs hover:bg-[#b8a071] transition-all shadow-sm"
            >
              Confirm Removal
            </button>
            <button 
              onClick={() => setDeletingId(null)}
              className="w-full py-3 bg-white border border-[#F2EEE6] text-[#BDB2A3] rounded-2xl font-bold text-xs hover:bg-[#FAF8F3] transition-all"
            >
              Keep Sample
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceClonePanel;
