# When memories speak

An online memorial website that recreates a loved one’s voice so family and friends can talk with them again.
Here is the description of entry page, 
1. there is a left to right panel
2. left panel is the menu "Home" , "Image", "Sound" 
3. Middle panel is interactive talk area, accept input box , and output box has the iamge of loved one and  the reply, which can be sounded by the
loved one's voice . 
4. Right panel  upper part login or icon (if logged already) with 'Subsription voices' and button 'Voice'


**Built with:**
- [Hono](https://hono.dev/) - Fast web framework for backend APIs
- [React Router](https://reactrouter.com/) - Frontend routing with SSR
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite database at the edge

Because love never goes silent.

## Features

- 📸 Multiple photo galleries organized by life themes
- 🎵 Integrated audio player with memorial music
- 📝 Memorial documents with expandable content
- 💬 Interactive comment system with D1 database
- 🌙 Dark mode support
- 📱 Fully responsive design
- ⚡ Fast edge deployment with Cloudflare Workers
- 🔒 Input sanitization and validation

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Cloudflare account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Set up the D1 database (see setup-db.md for details)
npx wrangler d1 create yalin-memorial-db

# Update wrangler.jsonc with the database ID from the output above

# Run database migrations
npx wrangler d1 execute yalin-memorial-db --local --file=./migrations/0001_create_comments.sql

# Start development server
npm run dev
```

### Development Commands

```bash
# Start dev server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

## Project Structure

```
├── app/
│   ├── routes/           # React Router routes
│   │   ├── home.tsx     # Main memorial page
│   │   └── gallery.tsx  # Photo galleries
│   ├── components/      # Reusable components
│   │   └── Comments.tsx # Comment system
│   ├── root.tsx         # Root layout
│   └── app.css          # Global styles
├── workers/
│   └── app.ts           # Hono backend with API routes
├── public/              # Static assets (images, audio, video)
├── migrations/          # D1 database migrations
└── wrangler.jsonc       # Cloudflare configuration
```

## Resources

- 🧩 [Hono on Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- 📦 [Vite Plugin for Cloudflare](https://developers.cloudflare.com/workers/vite-plugin/)
- 🛠 [Wrangler CLI reference](https://developers.cloudflare.com/workers/wrangler/)
- 🎨 [shadcn/ui](https://ui.shadcn.com)
- 💨 [Tailwind CSS Documentation](https://tailwindcss.com/)
- 🔀 [React Router Docs](https://reactrouter.com/)
