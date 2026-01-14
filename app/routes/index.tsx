import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "When memories speak" },
    { name: "description", content: "Because love never goes silent." },
  ];
}

const navItems = [
  { icon: "💬", label: "Whispers", active: true },
  { icon: "📷", label: "Family Photos", active: false },
  { icon: "🎬", label: "Life Moments", active: false },
  { icon: "📖", label: "Timeline", active: false },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Decorative candles and birds */}
      <div className="fixed top-8 left-8 text-9xl opacity-80 pointer-events-none">🕯️</div>
      <div className="fixed bottom-8 right-8 text-9xl opacity-80 pointer-events-none">🕯️</div>
      <div className="fixed bottom-20 left-12 text-7xl opacity-60 pointer-events-none">🕊️</div>
      <div className="fixed top-20 right-12 text-7xl opacity-60 pointer-events-none">🕊️</div>

      <div className="flex-1 max-w-7xl mx-auto my-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex">
        {/* Left Panel - Menu */}
        <aside className="w-48 border-r border-slate-200 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-blue-600 text-2xl">◆</span>
            <span className="font-semibold text-slate-700">Memorial</span>
          </div>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
            💝 Donate $5
          </button>
        </aside>

        {/* Middle Panel - Interactive Talk Area */}
        <main className="flex-1 p-6 flex flex-col">
          <h1 className="text-lg font-medium text-slate-800 mb-4">Talk with your loved one</h1>
          
          {/* Output Area */}
          <div className="flex-1 bg-slate-50 rounded-xl p-4 mb-4 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow-lg flex items-center justify-center mb-4">
              <span className="text-5xl">👤</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 text-slate-600 shadow-sm max-w-md text-center">
              <p>Hello, I'm here. What would you like to talk about?</p>
            </div>
            <button className="mt-3 text-blue-500 hover:text-blue-600 flex items-center gap-1">
              <span>🔊</span> Play voice
            </button>
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </main>

        {/* Right Panel - Login & Subscription */}
        <aside className="w-72 border-l border-slate-200 p-4 flex flex-col">
          {/* Login/User Icon */}
          <div className="flex items-center justify-end mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300">
              <span className="text-xl">👤</span>
            </div>
          </div>

          {/* Subscription Voices */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <h3 className="font-medium text-slate-800 mb-3">Subscription voices</h3>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Voice
            </button>
          </div>

          {/* Memorial Messages */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-medium text-slate-800 mb-3">Memorial Messages</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="bg-white rounded-lg px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Forever in our hearts
                </div>
              </div>
              <div className="flex items-start gap-2 justify-end">
                <div className="bg-blue-500 rounded-lg px-3 py-2 text-sm text-white">
                  We miss you dearly
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
