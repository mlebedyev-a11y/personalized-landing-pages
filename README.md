This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Flexi chatbot

Each `/l/<slug>` page carries **Flexi**, a chat widget that answers prospect questions
grounded in the four KB docs at the project root.

- `npm run build:kb` bakes those docs into `data/kb-context.ts` (committed, because the
  root docs are outside this repo). It also runs as part of `npm run match` — re-run and
  commit whenever a KB doc changes.
- Env vars live in `.env` (git-ignored): `ANTHROPIC_API_KEY` (required — get one at
  console.anthropic.com) and `SLACK_WEBHOOK_URL` (optional — reused from the
  view-notification feature to post Flexi transcripts to Slack). Set the same values in
  the Vercel project env for preview/production.
- API route: `app/api/flexi/route.ts` (Node serverless, streams Claude Haiku 4.5, per-IP
  rate limited). Widget: `components/FlexiWidget.tsx`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
