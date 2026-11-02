# ✦ Shreya Roshan — Now Shipping

My personal portfolio, designed like a **product launch**: a dreamy dusk-purple launch event layered with a paper, stamp and sticker collage. I'm a data scientist & AI engineer, and this site is the v1.0 release notes.

## What's inside

| Section | What it is |
|---|---|
| **Hero** | A launch window floating over a parallax planet sky with twinkling stars and shooting stars. Press *Start launch sequence*. |
| **Spec sheet** | Me, written up as a product spec. Hover the languages. |
| **Changelog** | Experience and leadership as versioned release notes. |
| **The lineup** | Projects as 3D tilt and flip product cards. |
| **Playground** | An interactive **k-means constellation maker**: paint stars, pick *k*, and watch the clusters converge. |
| **Toolbox** | A draggable sticker sheet of skills, plus certifications as rubber stamps. |
| **Contact** | Click-to-copy email, LinkedIn and GitHub. |

## Easter eggs 🥚

There are 8 hidden secrets, and the counter in the nav tracks how many you've found (it's saved in your browser). If you get stuck, click it for hints. Some are more hidden than others…

## Tech

Plain HTML, CSS and vanilla JavaScript, with no build step and no dependencies apart from Google Fonts (Space Grotesk, Instrument Serif, JetBrains Mono). Canvas is used for the sky, the sparkle trail and the k-means playground. It respects `prefers-reduced-motion` and works on phones.

```
index.html   # structure & content
styles.css   # design system + all styling
main.js      # interactions, mini-games, easter eggs
```

## Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

Hosted on GitHub Pages.
