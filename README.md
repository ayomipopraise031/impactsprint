# ImpactSprint

A demo web app matching NYSC corps members with short, high-impact sprints from verified NGOs.

## Run locally

Just open `index.html` in any modern browser — it's a single-file React app loaded via CDN, no build step required.

## Live demo

Once deployed (see [DEPLOY.md](DEPLOY.md)), share the URL with testers. Each visitor gets their own private session that persists in their browser via localStorage.

## What's included

- **Onboarding** — name, email, NYSC state code (validates all 36 states + FCT), discipline, simulated verification
- **Sprint feed** — search and filter across 5 seeded sprints in Lagos, Abuja, Kano, Enugu, and Port Harcourt
- **Sprint detail** — scope, tasks, deliverable, NGO info, dynamic match scoring
- **Application flow** — motivation note with character count
- **Workspace** — active sprint, messages, deliverable upload, completion notes
- **Portfolio** — earned badges, endorsements, feedback submission, PDF export
- **Profile** — editable bio, skills, weekly availability, photo upload

## Deploy

See [DEPLOY.md](DEPLOY.md) for Vercel, GitHub Pages, and Netlify Drop instructions.
