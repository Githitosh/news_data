# news_data agent notes

News player only (no humor / reply path). Keep settings + clickable X URL links; do not strip player features for an X-only movies host.

Stock fetch: try `news_movies` `v1/` first, then `githito.xapi` `api/v1/` until Collect retargets. Do not invent Collect triggers (`repository_dispatch`, etc.).

Rebuild with `python3 build.py` after editing `src/`.
