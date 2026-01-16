export interface VoiceSample {
  id: string;
  name: string;
  blob: Blob;
  base64: string;
  duration: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppMode {
  IDLE = 'IDLE',
  CHAT = 'CHAT',
  LIVE = 'LIVE'
}
