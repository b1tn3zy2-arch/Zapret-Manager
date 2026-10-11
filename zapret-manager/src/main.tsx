import React from "react";
import ReactDOM from "react-dom/client";

import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/container-queries.css";

import Root from "@/app/Root";
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
    <Root trayView={isTrayView} />
  </React.StrictMode>
);
