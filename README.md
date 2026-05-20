# Signal Deck Futures

A **self-updating, single-file** MES/ES futures signal dashboard for **paper-trading practice and education only**.

> **NOT FINANCIAL ADVICE.** Futures are leveraged and you can lose more than your initial deposit. Signals are generated from public **delayed** market data (typically 15–20 minutes on Yahoo Finance) using simple technical heuristics. Never trade real money based on AI-generated signals.

---

## What it does

Replicates the SIGNAL DECK FUTURES analyst prompt as a live, browser-based artifact. Every refresh it:

1. Pulls front-month futures bars (5-minute + daily) from Yahoo Finance through public CORS proxies.
2. Computes **MACD(12,26,9)**, **RSI(14)** and **session-anchored VWAP** client-side.
3. Derives **Overnight High/Low**, **Prior Day H/L/C**, **Today's H/L** from the bar stream.
4. Classifies the current **trading session** in Eastern Time (RTH / Pre-Market / ETH-Globex / Daily Break / Weekend Closed).
5. Pulls **news headlines** from the Yahoo Finance RSS feed and flags **binary events** (FOMC, CPI, NFP, earnings, geopolitical) by keyword.
6. Builds the full **Signal Deck output**: ACTION (LONG / SHORT / WAIT), confidence, entry plan, stop, two targets, scorecard, reasoning, exit triggers, risk-management rules.
7. Auto-refreshes on a configurable interval (default 30 s) and **forces WAIT** when a binary event is detected or the market is closed.

All processing runs in the browser — no backend, no API keys, no server.

## Live demo

Once deployed via GitHub Pages, the dashboard is available at:

```
https://<your-github-username>.github.io/Kira-Claude-Builds/
```

## Deploying to GitHub Pages

1. Merge this branch to `main` (or use the `signal-deck-artifact` branch directly).
2. In your repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main` (or whichever branch contains `index.html`) · folder: `/ (root)`
3. Save. GitHub Pages will publish the URL within ~1 minute.

That's it. `index.html` is the entire app.

## Running locally

```bash
# Any static server works; for example with Python:
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also just open `index.html` directly in a browser, but some browsers block CORS-proxy fetches from `file://` origins — a local server is more reliable.

## Settings (persisted in localStorage)

| Setting        | Default | Notes                                                                |
|----------------|---------|----------------------------------------------------------------------|
| Symbol         | `ES=F`  | Front-month ES. Also supports `NQ=F`, `YM=F`, `RTY=F`.              |
| Account ($)    | 1000    | Used to compute max risk and contract sizing.                        |
| Risk % / trade | 2       | Standard small-account rule.                                         |
| Refresh (sec)  | 30      | Min 10 s. Public proxies will rate-limit if too aggressive.          |
| Audio alert    | off     | Plays a tone when ACTION flips between refreshes.                    |

## Signal logic

- **MACD Momentum** — `PASS-BULL` if line>signal and histogram expanding; `PASS-BEAR` if inverse.
- **RSI + VWAP** — `PASS-BULL` if oversold + above VWAP, or trending up + above VWAP. Inverse for `PASS-BEAR`.
- **Volume / Flow** (CVD proxy) — share of up-bar volume in last 20×5m bars; >65% bull, <35% bear.
- **Trend / Pattern** — daily close vs EMA20/EMA50.
- **News / Macro** — keyword-based bull/bear scoring from RSS headlines.

**ACTION rules:**
- `LONG` requires ≥3 PASS-BULL signals and zero PASS-BEAR.
- `SHORT` requires ≥3 PASS-BEAR signals and zero PASS-BULL.
- `WAIT` otherwise — including any time the market is closed or a binary-event keyword appears in the news feed.

**Entry plan:**
- Stop = `max(2 × avg 5-min range, 0.15% of price)`, rounded to 0.25-pt tick, clamped to 2–15 pts.
- T1 = 1.5R, T2 = 3R.
- Position size = `floor(max risk dollars / MES stop dollars)`.

## Data sources

- [Yahoo Finance — chart API](https://query1.finance.yahoo.com/v8/finance/chart/ES=F) (front-month continuous)
- [Yahoo Finance — RSS headlines](https://feeds.finance.yahoo.com/rss/2.0/headline)
- CORS proxy fallbacks: `corsproxy.io`, `allorigins.win`, `codetabs.com`, `thingproxy.freeboard.io`

## Limitations & honest caveats

- **Yahoo data is delayed 15–20 minutes** on most futures contracts. Do not use this for live execution timing.
- **Public CORS proxies** can rate-limit, go down, or be blocked by ad-blockers. The app rotates through 4 of them; if all fail, you'll see a clear error in the top bar.
- **News classifier is keyword-based**, not LLM-grade. It will sometimes mis-tag headlines. Always read the actual story.
- **No order routing.** This is a read-only dashboard. Place trades through your broker (NinjaTrader / Tradovate / TopstepX / etc.).
- **No backtest engine.** The signal logic is a reasonable heuristic, not an optimised system. Past patterns do not guarantee future results.

## File structure

```
Kira-Claude-Builds/
├── index.html       # the entire dashboard (HTML + CSS + JS in one file)
└── README.md        # this file
```

## License

Educational artifact — use at your own risk. **Not financial advice.**
