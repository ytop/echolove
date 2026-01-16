import { Upload, FileAudio, FileVideo } from "lucide-react";

export function VoiceUpload() {
  return (
    <div className="w-full max-w-md bg-white/50 backdrop-blur-sm border border-stone-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <FileAudio size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-stone-700">Personalize Voice</h3>
      </div>
      <p className="text-xs text-stone-500 mb-4">
        Upload an audio (WAV) or video file of your loved one's voice to adjust the conversation tone.
      </p>

      <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 flex flex-col items-center justify-center text-stone-400 hover:border-amber-400 hover:bg-amber-50/50 transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
            <Upload size={20} className="text-stone-500 group-hover:text-amber-600" />
        </div>
        <span className="text-xs font-medium">Click to upload or drag & drop</span>
        <span className="text-[10px] mt-1 text-stone-400/80">WAV, MP4, MOV supported</span>
      </div>
    </div>
  );
}
