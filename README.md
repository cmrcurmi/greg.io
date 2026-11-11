# greg.io: deploying on Vercel

```
public/index.html   the site (same design as the Claude version)
public/greg.jpg     the dorm-cam photo
api/state.js        GET: all predictions and wake-up reports
api/predict.js      POST: place or change today's guess
api/report.js       POST: the big red button (only the first report of the day counts)
api/undo.js         POST: undo a false alarm
lib/store.js        Redis connection and Eastern-time helpers
```

## 1. Put the project on GitHub
Create an empty repository on GitHub, then from this folder:

    git init
    git add .
    git commit -m "greg.io"
    git branch -M main
    git remote add origin https://github.com/<you>/greg-io.git
    git push -u origin main

## 2. Import it into Vercel
vercel.com → Add New → Project → pick the repository → leave Framework Preset on "Other" → Deploy.
The first deploy will load, but guesses won't save yet because there is no database.

## 3. Add the database
In the project: Storage → Create Database (or Marketplace) → Upstash for Redis → free plan → connect it to this project.
Vercel adds the connection environment variables automatically.

## 4. Redeploy
Deployments → the latest one → ⋯ → Redeploy. Environment variables only take effect on a new deploy.

Your site is now live at `https://<project-name>.vercel.app`.

## Optional: a custom domain
Project → Settings → Domains → add a domain you own. You must buy the domain first (greg.io itself is almost
certainly taken; something like greg-wakeup.com or a cheap .xyz will do).

## Notes
- Times and the daily reset run on Eastern time.
- Pages refresh every 5 seconds, so everyone sees new guesses and the wake-up report almost immediately.
- Names aren't password-protected, so it runs on the honour system, as before.
