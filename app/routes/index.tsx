import type { Route } from "./+types/index";
import {
  MessageCircle,
  Image as ImageIcon,
  Film,
  Calendar,
  Heart,
  User,
  Mic,
  Send,
  Play,
  Settings,
  Menu,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "../components/AuthModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Memorial - When memories speak" },
    { name: "description", content: "Because love never goes silent." },
  ];
}

const navItems = [
  { icon: MessageCircle, label: "Whispers", active: true },
  { icon: ImageIcon, label: "Family Photos", active: false },
  { icon: Film, label: "Life Moments", active: false },
  { icon: Calendar, label: "Timeline", active: false },
];

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch user", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; requiresAuth?: boolean };

      if (data.requiresAuth) {
        setAuthMode("login");
        setIsAuthModalOpen(true);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-800 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden relative">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user: any) => setUser(user)}
        initialMode={authMode}
      />
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/20 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px] animate-float-slow delay-1000" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-100/20 rounded-full blur-[80px] animate-float-slow delay-500" />
      </div>

      <div className="relative z-10 h-screen flex flex-col md:flex-row max-w-7xl mx-auto p-4 md:p-6 lg:p-8 gap-6">

        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white font-serif italic shadow-sm">M</div>
            <span className="font-semibold text-stone-700 tracking-wide">Memorial</span>
          </div>
          <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-full">
            <Menu size={20} />
          </button>
        </div>

        {/* Left Sidebar - Navigation */}
        <aside className="hidden md:flex w-64 flex-col bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 p-6 transition-all hover:shadow-md hover:bg-white/80">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md rotate-3">
              <Heart size={16} fill="currentColor" />
            </div>
            <span className="font-serif text-xl font-medium text-stone-800 tracking-tight">Memorial</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 group ${
                  item.active
                    ? "bg-white shadow-sm text-amber-900 font-medium ring-1 ring-black/5"
                    : "text-stone-500 hover:bg-white/60 hover:text-stone-800 hover:shadow-sm"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${item.active ? "text-amber-500" : "text-stone-400 group-hover:text-amber-500/70"}`}
                />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-stone-100">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium">
              <Heart size={16} className="animate-pulse" fill="currentColor" />
              <span>Support Us</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Chat Area */}
        <main className="flex-1 flex flex-col bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 overflow-hidden relative">
          {/* Header */}
          <div className="p-6 border-b border-stone-100/50 flex justify-between items-center bg-white/30">
            <div>
              <h1 className="text-lg font-medium text-stone-800">Conversation</h1>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Online now
              </p>
            </div>
            <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100/50 rounded-full transition-colors">
              <Settings size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in-up">
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 rounded-full opacity-70 group-hover:opacity-100 blur transition-opacity duration-500" />
                <div className="relative w-32 h-32 rounded-full bg-stone-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                   {/* Placeholder for user image */}
                   <User size={48} className="text-stone-300" />
                </div>
                <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-amber-500 cursor-pointer hover:scale-110 transition-transform">
                  <Play size={14} fill="currentColor" />
                </div>
              </div>

              {/* Message Bubble */}
              <div className="bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl rounded-tr-sm shadow-sm border border-stone-100 text-center max-w-sm transform transition-all hover:shadow-md">
                <p className="text-stone-700 leading-relaxed text-lg font-serif italic">
                  "Hello, I'm here. I've been waiting to hear from you. What's on your mind today?"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white rounded-full text-xs font-medium text-stone-500 shadow-sm border border-stone-100 hover:border-amber-200 hover:text-amber-600 transition-colors">
                  Tell me a story
                </button>
                <button className="px-4 py-2 bg-white rounded-full text-xs font-medium text-stone-500 shadow-sm border border-stone-100 hover:border-amber-200 hover:text-amber-600 transition-colors">
                  I miss you
                </button>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-white/80 border-t border-stone-100">
            <div className="relative flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-200 focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-inner">
              <button className="p-3 text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 rounded-xl transition-colors">
                <Mic size={20} />
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none focus:outline-none px-2 text-stone-700 placeholder-stone-400"
              />
              <button className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300">
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Conversations are private and secure.
            </p>
          </div>
        </main>

        {/* Right Sidebar - Profile & Info */}
        <aside className="hidden lg:flex w-80 flex-col gap-6">
          {/* Profile Card */}
          {user ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 p-6 flex items-center justify-between group cursor-pointer hover:bg-white/90 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 ring-2 ring-white shadow-sm shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{user.email}</p>
                  <p className="text-xs text-stone-500">Free Plan</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-stone-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 p-6 flex items-center justify-between group cursor-pointer hover:bg-white/90 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 ring-2 ring-white shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">Guest</p>
                  <p className="text-xs text-stone-500">Sign in for more</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Login
              </div>
            </div>
          )}

          {/* Subscription Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-xl font-medium tracking-wide">
                  Premium
                  <br />
                  Voices
                </h3>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-medium backdrop-blur-sm">
                  PRO
                </span>
              </div>
              <p className="text-indigo-200 text-xs mb-6 leading-relaxed">
                Unlock lifelike voice interactions and unlimited memories timeline.
              </p>
              <button
                onClick={handleUpgrade}
                className="w-full py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          </div>

          {/* Recent Messages / Memories */}
          <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-stone-800">Recent Whispers</h3>
              <button className="text-xs text-amber-600 hover:underline">View all</button>
            </div>

            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-stone-200 space-y-4">
                <div className="relative group">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-stone-300 ring-4 ring-[#f8f7f4] group-hover:bg-amber-400 transition-colors" />
                  <p className="text-xs text-stone-400 mb-1">Yesterday</p>
                  <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-stone-100 text-sm text-stone-600 group-hover:shadow-md transition-all">
                    "Thinking of you always..."
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-stone-300 ring-4 ring-[#f8f7f4] group-hover:bg-amber-400 transition-colors" />
                  <p className="text-xs text-stone-400 mb-1">Last Week</p>
                  <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-stone-100 text-sm text-stone-600 group-hover:shadow-md transition-all">
                    Shared a photo from 1998.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
