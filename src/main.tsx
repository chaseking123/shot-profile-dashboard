/*
This file bootstraps the React app and mounts the dashboard into the root DOM node.
It wires the global stylesheet and the top-level App component together.
*/
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
