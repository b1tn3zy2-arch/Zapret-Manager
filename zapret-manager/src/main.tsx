import React from "react";
import ReactDOM from "react-dom/client";

import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/container-queries.css";

import App from "@/app/App";
import Providers from "@/app/providers";
import TrayMenuRoot from "@/tray/TrayMenuRoot";
import { mark } from "@/lib/perf";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Элемент #root не найден в index.html");
}

mark("app:boot");

document.addEventListener("contextmenu", (event) => {
  const target = event.target;

  if (
    target instanceof HTMLElement &&
    (target.closest("input, textarea, [contenteditable='true']") !== null ||
      window.getSelection()?.toString() !== "")
  ) {
    return;
  }

  event.preventDefault();
});

const isTrayView =
  new URLSearchParams(window.location.search).get("view") === "tray";

if (isTrayView) {
  document.documentElement.dataset.view = "tray";
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <Providers>{isTrayView ? <TrayMenuRoot /> : <App />}</Providers>
  </React.StrictMode>
);
