# news_data

News program + player UI (video playback, settings, clickable X URL links). Seeded from the root news player in [news-shorts](https://github.com/Githitosh/news-shorts) (not `/humor/`).

**Pages (intended):** https://githitosh.github.io/news_data/

## Assumed publish / stock URLs

Until Collect in [githito.xapi](https://github.com/Githitosh/githito.xapi) is retargeted, the player reads stock from the existing api branch, and also tries `news_movies` first so a retarget “just works”:

| Role | URL |
| --- | --- |
| Stock (current, until xapi retargets) | `https://raw.githubusercontent.com/Githitosh/githito.xapi/api/v1/stock-news-ja.json` (and `stock-news-en.json`) |
| Stock (future / tried first) | `https://raw.githubusercontent.com/Githitosh/news_movies/main/v1/stock-news-*.json` |
| Movies host for X (public mp4 + burned URL) | [news_movies](https://github.com/Githitosh/news_movies) — intended Pages `https://githitosh.github.io/news_movies/` |
| This player (app-ready UI + links) | This repo — Pages `https://githitosh.github.io/news_data/` |

Collect trigger stays Actions only: https://github.com/Githitosh/githito.xapi/actions/workflows/collect.yml

## Local build

```bash
python3 build.py   # writes index.html + version.json from src/
```

Open `index.html` (or serve the repo root). Defaults: country Japan, language Japanese. No BGM / music feature.

## Enable GitHub Pages (owner)

The seed agent’s token could not flip Pages (`403 Resource not accessible by integration`). Owner steps:

1. Open https://github.com/Githitosh/news_data/settings/pages
2. **Build and deployment → Source:** Deploy from a branch
3. Branch: `main` / folder: `/` (root)
4. Save. Site URL should become https://githitosh.github.io/news_data/
5. Optional: set repo **Homepage** to that URL

Keep this repo public until the later privatize task (GMPS-101).

## Copied from news-shorts

Included: root player (`src/app.html`, `engine.js`, `never.js`, `ui_ja.js`), `lib/`, wallpaper `assets/bg_*.jpg`, icons, `manifest.webmanifest`, `.nojekyll`, `terms.html`, `ja/`, `samples/`, `build.py`, `run.py`.

Excluded: `/humor/`, `src/humor.html`, `reply-news/`, Android humor shell, song/midi BGM assets, `music.js`, graphs.
