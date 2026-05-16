# Shot Profile Dashboard Readme

## Instructions To Run Locally
In a terminal window, navigate to the folder where this readme file (and the package.json) lives.
Run 'npm install'
Once the install is complete, run 'npm run dev'


### Prerequisites

Before running the app, make sure you have Node.js installed. Per https://vite.dev/guide/ Vite requires Node 20.19+ or 22.12+ .

Recommended:

```bash
node -v
npm -v
```

If `node -v` shows an old version, install the latest Node.js LTS version before continuing. https://nodejs.org/en/download

### Run the App

#### Terminal / Git Bash / macOS / Linux / Windows PowerShell

From the project folder (where this file currently is), run:

```bash
npm install (or npm ci for lockfile install)
npm run dev
```

Vite will start a local development server. Open the URL shown in the terminal, usually:

```text
http://localhost:5173
```

To stop the server, press:

```text
Ctrl + C
```

---

### Common Issues

#### `npm` or `node` is not recognized

Node.js may not be installed, or it may not be available in your system PATH.

Check with:

```bash
node -v
npm -v
```

If those commands fail, install Node.js LTS and restart your terminal or VS Code.

#### `npm run dev` fails after cloning or downloading the project

Make sure dependencies were installed first:

```bash
npm install
```

Then run:

```bash
npm run dev
```

#### The app opens on a different localhost port

If port `5173` is already in use, Vite may use another port. Use the exact URL shown in the terminal.

Example:

```text
Local: http://localhost:5174/
```