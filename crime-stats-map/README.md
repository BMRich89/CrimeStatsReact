This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## GitHub Codespaces (PR Preview on Mobile)

This repo includes a ready-to-use [GitHub Codespaces](https://github.com/features/codespaces) configuration so you can preview any PR from your phone—no local setup needed.

### Opening a Codespace

1. On any PR (or the `main` branch), click **Code → Codespaces → Create codespace on this branch**.
2. The Codespace will automatically install dependencies and start the Next.js dev server on port **3000**.
3. Codespaces forwards port 3000 and shows a notification or a **Ports** tab link—click it to open the app.

### Opening the preview on mobile

1. In the Codespace, open the **Ports** tab (bottom panel in VS Code for the Web).
2. Find port **3000** and copy the **Forwarded Address** URL (format: `https://<codespace-name>-3000.app.github.dev`).
3. Open that URL in any browser on your phone—no sign-in required because the port visibility is set to **Public**.

### Setting `API_HOST`

The frontend uses the `API_HOST` environment variable to reach the backend API.

| Scenario | What to set `API_HOST` to |
|---|---|
| API running locally (same machine) | `http://localhost:7015` (default) |
| API running in its own Codespace | The API's forwarded URL, e.g. `https://<api-codespace-name>-7015.app.github.dev` |

**To change `API_HOST`:**

1. Edit `.devcontainer/devcontainer.env` in this repo and update the `API_HOST` line:
   ```
   API_HOST=https://<api-codespace-name>-7015.app.github.dev
   ```
2. Rebuild the container: **Ctrl/Cmd + Shift + P → Codespaces: Rebuild Container**.

The dev server will pick up the new value on the next start.

> **Tip:** If you need a quick override without rebuilding, create a `crime-stats-map/.env.local` file (git-ignored) with `API_HOST=<your-url>` and restart the dev server (`Ctrl+C`, then `npm run dev` in the terminal).

---

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
