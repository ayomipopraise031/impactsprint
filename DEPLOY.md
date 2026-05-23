# Deploy ImpactSprint to Vercel

Your demo is in this folder. Pick one of the three paths below — all produce a public URL like `impactsprint-xxxx.vercel.app` you can share with testers.

---

## Path A — Vercel CLI (fastest if you have Node)

Needs Node.js installed. From this folder:

```
npx vercel
```

First time it'll ask you to sign in (opens your browser). Accept the defaults for every prompt. After ~10 seconds you get a URL.

To promote to production:
```
npx vercel --prod
```

---

## Path B — GitHub → Vercel (no CLI, no Node needed)

1. Go to **github.com/new** and create a new public repo named `impactsprint`.
2. Upload `index.html` and `vercel.json` from this folder via the GitHub web UI ("Add file" → "Upload files").
3. Go to **vercel.com/new**, sign in with GitHub, click "Import" next to the `impactsprint` repo.
4. Accept defaults, click **Deploy**. ~30 seconds later you get a public URL.

Every time you push a change to GitHub, Vercel auto-redeploys.

---

## Path C — Netlify Drop (literally drag-and-drop, 20 seconds)

Vercel doesn't have a no-account drag-and-drop, but Netlify does. If you just want the URL fast:

1. Open **app.netlify.com/drop** in your browser.
2. Drag the entire `impactsprint-web` folder onto the page.
3. Done — you get a public URL like `impactsprint-xxxx.netlify.app`.

(You can claim it permanently by signing in afterwards.)

---

## What testers see

- First visit: onboarding form (name, email, NYSC code, discipline)
- After onboarding: full app with discover/apply/workspace/portfolio/profile
- Their data is saved in their **own browser** (localStorage), so refreshing keeps them logged in
- "Sign out & reset demo" on the Profile screen clears their session

## Collecting feedback

The Portfolio screen has a feedback textarea, but since this is a per-visitor demo, the feedback only saves to their browser — you won't see it. To collect feedback, share the URL alongside a separate channel (Google Form, WhatsApp, etc.) for testers to send you their notes.

If you want feedback to flow back to a real database you control, that needs the full-stack version (the other folder, `impactsprint/`).
