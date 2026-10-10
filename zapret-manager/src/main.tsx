import React from "react";
import ReactDOM from "react-dom/client";

import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/container-queries.css";

import App from "@/app/App";
import Providers from "@/app/providers";
import { mark } from "@/lib/perf";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Элемент #root не найден в index.html");
}

mark("app:boot");

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
