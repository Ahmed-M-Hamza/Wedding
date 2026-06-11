═══════════════════════════════════════════════════════════════
  ASSETS FOLDER — Wedding Invitation Media Files
═══════════════════════════════════════════════════════════════

Place your media files in this folder:

1. music.mp3
   - Background wedding music (MP3 format recommended)
   - The site works fine without it — the music button will be disabled

2. couple.png
   - Couple / memory photo (PNG or JPG)
   - Displayed in the photo-moment section

3. venue.jpg
   - Venue photo (from Google Maps or your own)
   - Displayed above the location section
   - The site works fine without it — the image area stays hidden

───────────────────────────────────────────────────────────────
  TIPS
───────────────────────────────────────────────────────────────

• Keep music.mp3 under 5 MB for fast loading on mobile data
• Use a romantic instrumental track for best effect
• Compress couple.jpg for web (quality 80–85% is usually enough)

───────────────────────────────────────────────────────────────
  RSVP SERVER (عداد تأكيد الحضور)
───────────────────────────────────────────────────────────────

To enable the RSVP counter (one confirmation per IP):

  npm install
  npm start

Then open: http://localhost:3000

RSVP data (local dev): data/rsvps.json (IPs are hashed).

On Render, the local file is wiped on every deploy — use Upstash Redis (free):

  1. Create account at https://upstash.com
  2. Create a Redis database (free tier)
  3. In Render → Environment, add:
       UPSTASH_REDIS_REST_URL
       UPSTASH_REDIS_REST_TOKEN
  4. Redeploy — the counter will persist across updates

Optional: set RSVP_SALT to a random secret before going live.

═══════════════════════════════════════════════════════════════
