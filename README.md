# Shot Profile Dashboard

## How To Run Locally

From the project folder, run:

```bash
npm install
npm run dev
```

Vite will start a local development server. Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

Before running the app, make sure Node.js is installed. Vite requires Node `20.19+` or `22.12+`.

Recommended checks:

```bash
node -v
npm -v
```

Available scripts:

- `npm run dev` starts the local Vite dev server
- `npm run build` runs TypeScript build checks and creates a production bundle
- `npm run lint` runs ESLint across the repo
- `npm run preview` serves the production build locally

## Chosen Tech Stack

- `React + TypeScript`
  - React supports a component-driven dashboard UI.
  - TypeScript gives us safer shared contracts between the data layer and the views.
- `Vite`
  - Vite provides a fast local development loop and simple static asset handling.
- `Papa Parse`
  - Papa Parse loads and parses the CSV in the browser without custom parsing code.
- `Zod`
  - Zod validates and normalizes incoming CSV rows into a predictable shape.
- `Recharts`
  - Recharts powers the compare visualizations.

## Dashboard Features

- Two dashboard views available in sidebar nav:
  - Shot Type
    - **Answers question: 'Which players are taking which types of shots?'**
  - Efficiency
    - **Answers question: 'Which shots are efficient or inefficient?'**
- Shared filter toolbar across both views. Allows the user to alter the context related to displayed shot data.
  - **Answers question: 'How does shot-making change by context?'**
  - Possible filters:
    - Date range
    - Shot Type (all non-complex shot types)
    - Outcome (all, made, missed)
    - Contest Level (all, uncontested, lightly contested, heavily contested)
    - Creation (all, off dribble, catch and shoot)
    - Shot Clock (time range buckets: all, early clock, middle clock, late clock, very late clock)
- Shot Type view:
  - 'Shot Type by Player' chart displays which players are taking which shot types by %
    - Stacked shot-type distribution by player, allows for quick, visually appealing view of players.
    - Field Goal Attempted (FGA) totals for volume context
    - Team average row anchored to bottom of table for comparing player tendencies to team profile
    - Sortable rows if the shot types in the legend are clicked
  - 'Compare Players' diverging compare chart
    - Player-to-player comparison chart based on already loaded rows
    - Allows for teammate comparison for players that are not close to each other in 'Shot Type by Player' chart.
- Efficiency view:
  - 'Efficiency by Shot type' heatmap table displays what FG% players are shooting for each type of available shot.
    - FG% by shot type and player
    - Heatmap-style coloring relative to team average allows for quick visual indication of deviance from team average. Darker green indicates higher than average. Darker red indicates lower than average.
    - Neutral team average row for comparison to team tendencies
  - 'Compare Players' diverging compare chart
    - Player-to-player comparison chart based on already loaded rows
    - Allows for teammate comparison for players that are not close to each other in 'Efficiency by Shot Type' table.
- Shared dashboard behavior:
  - Filter state persists when switching views (with the exception of those not relevant)
  - Raw CSV parsing is done on initial load, not dashboard switch

## Assumptions Made

- Data source assumptions:
  - The CSV is small enough to parse once in the browser and keep in memory for the session, no backend or database required for this case (although it is built in a way to allow for this when required)
  - CSV rows may contain mixed runtime types such as numeric strings, decimal numbers, and uppercase boolean-like values like `TRUE` and `FALSE`
- Per instructions, assumed this was for a single team, not a larger list of players that would require pagination.
- UI and product assumptions:
  - The dashboard is desktop-first
  - No requirements related to translation or customization

## Tradeoffs Or Future Improvements

- Tradeoff: browser-side CSV parsing instead of a real backend
  - This kept scope low and made the project fast to prototype, focus on dashboard, not hosting/configuration
  - The downside is that parsing, filtering, and aggregation all happen client-side, which will not scale indefinitely
- Tradeoff: custom local UI for shot type stacked bar chart over component library
  - This gave tighter control over layout, sortable rows, added columns, highlighting
  - The downside is that it was a larger initial lift, and accessibility, consistency, and long-term maintenance stay fully owned by the project
- Tradeoff: little data calculation/deriviation
  - With limited time this allowed for a quick prototype without much time spent on deriving advanced statistics, pulling in outside data (etc.)
  - The downside is that the resulting aggregated data tells a story, but is simpler
- Tradeoff: in-memory cached dataset
  - Parsing once and reusing normalized rows keeps the app simple and performant for a small dataset
  - The downside is higher browser memory use, slower load, and no persistence or shared caching across users
- Tradeoff: Compare Players chart derived from already loaded rows
  - This avoids duplicate computation and keeps the API smaller
  - As a result, the compare logic is tied/coupled to the top-level view rows
- Future improvements:
  - Actual backend implementation
  - Unit testing
  - Saved filter presets such as 'last 5 games' or shareable URL query state
  - Support for richer derived metrics such as eFG% (3 pointer based on axis data), per-game splits, complex shot type, shot maps, etc. 

## Notes On Extending If The Dataset Were Much Larger

- Move parsing and aggregation off the client and into a backend service.
  - The browser should request the answer needed for the current screen instead of downloading and processing the full raw dataset.
  - Replace the CSV adapter with real endpoints
  - This would reduce page load time, lower browser memory usage, and centralize validation and aggregation logic.
- Store shot records in a database or warehouse instead of shipping the full dataset to the browser.
  - A queryable store gives better filtering performance, indexing, and control over larger structured datasets.
  - The client would receive only the fields and aggregates needed for the selected filters.
- Precompute common requests such as shot-type mix and FG% by player and filter dimensions.
  - Repeated summary queries are strong candidates for prepared aggregate tables instead of recalculating everything on every request.
- Paginate large result sets to avoid performance issues on the frontend.
- Cache API responses by filter signature instead of relying only on browser-side caching.
  - This allows repeated requests for the same dashboard slice to be reused across users and sessions.
- If deployed beyond local use, a likely AWS stack would be:
  - static frontend on S3 + CloudFront
  - backend on API Gateway + Lambda for lighter workloads, or look elsewhere if compute/data grows further
  - Determine database needs depending on scale
