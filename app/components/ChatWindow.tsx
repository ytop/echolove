import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, VoiceSample } from '../types';
import { Feather, CloudSun, Send } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  samples: VoiceSample[];
  persona: string;
  isLive: boolean;
  setIsLive: (val: boolean) => void;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  setMessages, 
  samples, 
  persona, 
  isLive, 
  setIsLive 
}) => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<string>('Quietly waiting');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStopLive = useCallback(() => {
    setIsLive(false);
    setStatus('A moment of peace');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  }, [setIsLive]);

  const handleStartLive = async () => {
    const apiKey = (window as any).ENV?.API_KEY;
    if (!apiKey) {
      alert("API Key is missing. Please check your environment.");
      return;
    }

    try {
      setIsLive(true);
      setStatus('Seeking resonance...');
      
      const { GoogleGenAI, Modality } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const systemPrompt = `
        You are emulating a specific loved one based on provided audio samples and context.
        Personality Description: ${persona || "A kind, supportive family member"}
        Your goal is to provide comfort, share memories, and be an empathetic bridge.
        Speak in the style, tone, and mannerisms of the person described.
      `.trim();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Heart-to-heart...');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            if (samples.length > 0) {
              samples.forEach(sample => {
                 sessionPromise.then(session => {
                    session.sendRealtimeInput({ 
                      media: { 
                        data: sample.base64, 
                        mimeType: 'audio/wav'
                      } 
                    });
                 });
              });
            }
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContextRef.current!,
                24000,
                1
              );
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current!.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               if (text) {
                 setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                      return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                    }
                    return [...prev, { id: Date.now().toString(), role: 'model', text, timestamp: new Date() }];
                 });
               }
            }
          },
          onerror: () => setStatus('Fading away...'),
          onclose: () => handleStopLive()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemPrompt,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setStatus('Waiting for breath...');
      setIsLive(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    if (!isLive) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I'm here, listening with love.",
          timestamp: new Date()
        }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFEFA]">
      <header className="h-20 border-b border-[#F7F3EB] bg-[#FFFEFA]/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FFFCEB] flex items-center justify-center text-[#9E8A6B]">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#6B5E4C]">Heart-to-Heart</h1>
            <p className="text-[10px] text-[#BDB2A3] flex items-center gap-2 uppercase tracking-[0.15em] font-bold">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#C9B081] animate-pulse' : 'bg-[#F2EEE6]'}`}></span>
              {status}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLive ? (
            <button 
              onClick={handleStopLive}
              className="px-5 py-2 bg-[#FAF8F3] border border-[#F2EEE6] text-[#9E8A6B] rounded-2xl text-xs font-bold hover:bg-[#F2EEE6] transition-colors"
            >
              Quiet Moment
            </button>
          ) : (
            <button 
              onClick={handleStartLive}
              className="px-5 py-2 bg-[#9E8A6B] text-white rounded-2xl text-xs font-bold hover:bg-[#857458] transition-all shadow-sm"
            >
              Start Resonance
            </button>
          )}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-sm border border-[#F7F3EB] flex items-center justify-center text-[#C9B081] mb-8">
              <CloudSun className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#6B5E4C] mb-3">Welcome Home</h3>
            <p className="text-sm text-[#9E8A6B] leading-relaxed mb-8 italic">
              A peaceful place for memories and soft words.
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-[#FFFCEB] text-[#6B5E4C] rounded-[2rem] rounded-tr-none border border-[#F9F5DE]' : 'bg-white text-[#6B5E4C] rounded-[2rem] rounded-tl-none border border-[#F2EEE6]'} p-6 shadow-sm`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] mt-3 block opacity-50 font-bold tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-[#FFFEFA] border-t border-[#F7F3EB]">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3 max-w-4xl mx-auto">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isLive ? "Speak softly or type here..." : "Share a thought..."}
            className="w-full pl-6 pr-14 py-4 bg-white border border-[#F2EEE6] rounded-3xl text-sm focus:ring-2 focus:ring-[#FFFCEB] outline-none transition-all placeholder:text-[#BDB2A3] shadow-sm"
          />
          <button 
            type="submit"
            className="absolute right-3 p-3 bg-[#9E8A6B] text-white rounded-[1.25rem] hover:bg-[#857458] transition-colors shadow-sm disabled:opacity-30 disabled:grayscale"
            disabled={!inputText.trim()}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-[#BDB2A3] mt-4 font-bold tracking-[0.2em] uppercase">
          A place for quiet reflection
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
