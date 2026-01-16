import { useState } from 'react';
import type { VoiceSample, ChatMessage } from '../types';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import VoiceClonePanel from '../components/VoiceClonePanel';
import DonationModal from '../components/DonationModal';

export default function Index() {
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [persona, setPersona] = useState<string>('');

  const addSample = (sample: VoiceSample) => {
    setSamples(prev => [...prev, sample]);
  };

  const removeSample = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFFEFA] to-[#FDFBF7] text-slate-800">
      <Sidebar 
        samplesCount={samples.length} 
        onOpenDonation={() => setShowDonation(true)} 
      />

      <main className="flex-1 flex flex-col md:flex-row h-full">
        <div className="flex-1 relative flex flex-col">
          <ChatWindow 
            messages={messages} 
            setMessages={setMessages}
            samples={samples}
            persona={persona}
            isLive={isLive}
            setIsLive={setIsLive}
          />
        </div>

        <aside className="w-full md:w-80 lg:w-96 border-l border-[#F7F3EB] bg-[#FDFBF7] flex flex-col">
          <VoiceClonePanel 
            samples={samples} 
            addSample={addSample} 
            removeSample={removeSample}
            persona={persona}
            setPersona={setPersona}
          />
        </aside>
      </main>

      {showDonation && (
        <DonationModal onClose={() => setShowDonation(false)} />
      )}
    </div>
  );
}
