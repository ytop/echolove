# Environment Setup

## Local Development

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your actual keys:
- `GOOGLE_API_KEY` - Google GenAI API key for voice chat
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `JWT_SECRET` - JWT secret for authentication

## Cloudflare Deployment

Set secrets via wrangler:

```bash
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put JWT_SECRET
```
