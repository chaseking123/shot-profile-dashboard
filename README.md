# Shot Profile Dashboard

## How To Run Locally

This project is not currently hosted or deployed. Run it locally from the project folder:

```bash
npm install
npm run dev
```

Vite will start a local development server. Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

Before running the app, make sure Node.js is installed. This project uses Vite `8.x`, which requires Node `20.19+` or `22.12+`.

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
  - React supports the component-driven dashboard UI.
  - TypeScript gives safer shared contracts between the dashboard views, context state, and data layer.
- `Vite`
  - Vite provides a fast local development loop and simple static asset handling for the CSV file.
  - The app is currently local-only, so Vite is enough to serve the frontend and static dataset during development.
- `CSV-backed data adapter`
  - There is no hosted backend and no external API integration in the current version.
  - The browser fetches the local static CSV from `public/data/shots.csv`, then parses, filters, and aggregates it in memory.
  - The data layer is still shaped like an API through `ShotAnalyticsApi`, which means a future API call could replace the CSV adapter without forcing the views to understand where the data came from.
- `Papa Parse`
  - Papa Parse loads and parses the CSV in the browser without custom CSV parsing code.
- `Zod`
  - Zod validates and normalizes incoming CSV rows into a predictable shape before the UI consumes them.
- `Recharts`
  - Recharts powers the player comparison charts where axes, tooltips, legends, and responsive chart behavior are useful.
- `Custom UI primitives and CSS`
  - The shot-type distribution table, efficiency heatmap table, buttons, table wrappers, filters, and layout pieces are built locally.
  - This kept the implementation lightweight and allowed the dashboard-specific table/chart hybrids to be tailored to the coaching and analytics use case.

## Dashboard Features

The dashboard is designed for a coaching staff, front office, or analytics team reviewing shot tendencies for 12 anonymized NBA players from the 2024-25 regular season. For this exercise, all 12 players are treated as if they are on the same team.

- Two dashboard views available in the sidebar navigation:
  - Shot Type
    - **Answers the question: 'Which players are taking which types of shots?'**
    - <img width="1827" height="987" alt="shot-type-view-with-filters" src="https://github.com/user-attachments/assets/1717629b-f6e7-4a34-850b-23299f16e0ac" />
  - Efficiency
     - **Answers the question: 'Which shots are efficient or inefficient?'**
    - <img width="1903" height="916" alt="efficiency-view-default" src="https://github.com/user-attachments/assets/87366e8f-b0d4-408e-83fe-f5ff3210e3b1" />
- Shared dashboard behavior:
  - A shared filter toolbar across both views. This allows the user to alter the context related to displayed shot data and answer the question: **'How does shot-making change by context?'**
  - The filter state persists when switching views, except for filters that are not relevant to the active view
  - Raw CSV parsing happens once on initial data load, not each time the user changes dashboard views
  - The team average rows provide a quick way to compare individual player tendencies against the assumed team profile

### How To Use

- Use the left sidebar to switch between `Shot Type` and `Efficiency`.
- Use the filter toolbar near the top of each view to change the context of the analysis.
- Change any filter values you want, then click `Apply` to update the dashboard.
- Click `Reset` to return the filters to their default state.
- Use the date range filters to narrow the sample to a specific part of the season.
- Use `Contest Level`, `Creation`, and `Shot Clock` to understand how shot-making changes by context.
- On the `Shot Type` view: 
  - Use the `Shot Type by Player` chart to see each player's shots taken by percentage.
  - Click shot-type labels in the legend to sort players by that shot type.
  - Use `FGA` to separate high-volume tendencies from low-volume noise.
- On the `Efficiency` view:
  - Use the heatmap table to find where players are above or below team average by shot type.
- On either view, use the `Compare Players` selectors to compare two players directly. This is useful for making team-based decisions for players that may not be near each other in their respective charts.
- The compare chart highlights the selected players in the main table/chart, making it easier to connect the detailed comparison back to the full team profile.

### Shot Type View

- `Shot Type by Player` displays which players are taking which shot types by percentage.
- Stacked row bars make player tendencies easy to scan.
- `FGA` totals provide volume context.
- The team average row is anchored to the bottom for comparison against the team profile.
- Sortable shot-type legend buttons help identify who relies most or least on each shot type.
- `Compare Players` shows the difference in shot frequency between two selected players.
- This is useful for identifying role differences, tendency outliers, and whether individual players are aligned with or diverging from the team shot profile.
- <img width="1905" height="918" alt="shot-type-view-compare-players" src="https://github.com/user-attachments/assets/84f550f3-3e44-4a36-b63f-b59ed7603657" />

### Efficiency View

- `Efficiency by Shot Type` displays FG% by player and shot type.
- Heatmap-style coloring shows whether each player is above or below **team average** for that shot type.
- Darker green cells indicate stronger efficiency relative to team average.
- Darker red cells indicate weaker efficiency relative to team average.
- The team average row gives a neutral baseline for the full filtered dataset.
- `Compare Players` shows the difference in FG% between two selected players.
- This is useful for finding efficient shot zones, low-efficiency tendencies, and possible coaching or roster-level questions.

## Assumptions Made

- The dataset is clean and intentionally small enough that a lightweight frontend-only approach is appropriate (built in a manner that allows for adapting).
- The data represents every shot attempt for 12 players from the 2024-25 regular season.
- Per the prompt, all 12 players are treated as if they are on the same NBA team.
- The CSV is small enough to parse once in the browser and keep in memory for the session.
- The current app does not require a backend, database, auth layer, or hosted API for the project scope.
- CSV rows may contain mixed runtime types such as numeric strings, decimal numbers, and uppercase boolean-like values like `TRUE` and `FALSE`.
- The main dashboard shot types are limited to non-complex categories such as `layup`, `post`, `floater`, `jumper`, and `heave`.
- Efficiency means plain `FG%`, not `eFG%`, points per shot, or expected value (no concept of 3-pointers).
- The dashboard is desktop-first, but the layout should remain usable on smaller screens.
- The goal is a polished, thoughtful 2-view dashboard rather than a broad set of unfinished features.

## Tradeoffs Or Future Improvements

- Tradeoff: browser-side CSV parsing instead of a real backend
  - This kept scope low and made the project fast to prototype, with time spent on the dashboard rather than hosting and infrastructure.
  - The downside is that parsing, filtering, and aggregation all happen client-side, which will not scale indefinitely.
- Tradeoff: local custom UI for the shot-type stacked bar chart and efficiency heatmap table
  - This gave tighter control over sortable rows, highlighted players, sticky team average rows, and analytics-specific visual behavior.
  - The downside is that accessibility, consistency, and long-term maintenance remain owned by this project.
- Tradeoff: simple derived metrics
  - With the time constraints and a desire to focus on the data at hand, I focused on showcasing the given data rather than deriving richer metrics.
  - Plain FG% and shot mix are easy to understand and map directly to the prompt.
  - Richer tactical analysis would need additional metrics such as `eFG%`, points per shot, shot quality, or per-game splits.
- Tradeoff: in-memory cached dataset
  - Parsing once and reusing normalized rows keeps the app simple and responsive for a small dataset.
  - The downside is higher browser memory use and no shared cache across users.
- Tradeoff: `Compare Players` charts are derived from already loaded view rows
  - This avoids duplicate computation and keeps the API surface smaller.
  - The downside is that compare logic is tied to the aggregation level of each top-level view.
- Future improvements:
  - Add unit tests around parsing, filtering, aggregation, and compare-player behavior.
  - Complex shot data.
  - Add a real API call implementation and backend service.
  - Add the ability to save filter presets such as `last 5 games`, `ignore late shot clock` or shareable URL query state.
  - Add richer derived metrics such as league average data, points per shot, per-game splits, complex shot type, or shot maps.
  - Add KPI cards for quick team-level takeaways before the detailed tables.
  - Add deeper data-quality reporting if the data source becomes less controlled.
  - Continue extracting shared dashboard behavior into small hooks/helpers as additional views are added.

### Adding A Future Dashboard View

The project is intentionally set up so another view can be easily implemented.

A future view, such as `Shot Map`, or `Player Summary`, would generally follow the same pattern:

- add a new dashboard view key to the shared view state
- add a new sidebar nav item
- create a new view component under `src/components/views`
- add any new aggregation logic under `src/data/transforms`
- expose the new data shape through the `ShotAnalyticsApi` contract
- store the loaded rows in dashboard context if the data should be shared across the app
- reuse the existing filter toolbar where the filters are relevant

That separation makes the app extensible. The view components are not responsible for parsing CSVs or knowing where data comes from. They ask the data layer for already-shaped dashboard rows, which keeps future views focused on analysis and presentation.

## Notes On Extending If The Dataset Were Much Larger

- Move parsing and aggregation off the client and into a backend service.
  - The browser should request the answer needed for the current screen instead of downloading and processing the full raw dataset.
  - This would reduce page load time, lower browser memory usage, and centralize validation and aggregation logic.
- Store shot records in a database or warehouse instead of shipping the full dataset to the browser.
  - A queryable store gives better filtering performance, indexing, and control over larger structured datasets.
  - The client would receive only the fields and aggregates needed for the selected filters.
- Replace the CSV adapter with real endpoints such as:
  - `GET /api/shot-analytics/filter-options`
  - `GET /api/shot-analytics/shot-type-by-player`
  - `GET /api/shot-analytics/efficiency-by-shot-type`
- Precompute (and potentially cache) common requests such as shot-type mix and FG% by player and filter dimensions.
  - Repeated summary queries are strong candidates for prepared aggregate tables instead of recalculating everything on every request.
- Paginate or virtualize large result sets to avoid frontend rendering issues.
- Cache API responses by filter signature instead of relying only on browser-side caching.
  - This allows repeated requests for the same dashboard slice to be reused across users and sessions.
- If deployed beyond local use, a likely AWS stack would be:
  - static frontend on `S3 + CloudFront`
  - backend on `API Gateway + Lambda` for lighter workloads, or `ECS/Fargate` if compute and service complexity grow
  - raw file storage in `S3`
  - cleaned/queryable data in `RDS`, `Aurora`, or `Redshift` depending on scale
  - `CloudWatch` logging, alarms, and tracing for observability
