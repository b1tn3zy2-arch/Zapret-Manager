import { Suspense, lazy } from "react";

import Providers from "@/app/providers";

const App = lazy(async () => await import("@/app/App"));
const TrayMenuRoot = lazy(async () => await import("@/tray/TrayMenuRoot"));

export interface RootProps {
  trayView: boolean;
}

export default function Root({ trayView }: RootProps) {
  return (
    <Providers>
      <Suspense fallback={null}>
        {trayView ? <TrayMenuRoot /> : <App />}
      </Suspense>
    </Providers>
  );
}
