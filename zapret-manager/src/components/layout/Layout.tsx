import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TitleBar from "@/components/layout/TitleBar";
import NoiseOverlay from "@/components/shared/NoiseOverlay";
import PostProcessingLayer from "@/components/shared/PostProcessingLayer";
import { useFullscreen } from "@/hooks/useFullscreen";

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <div className="bg-bg-primary flex h-screen w-screen flex-col overflow-hidden">
      {isFullscreen ? null : (
        <TitleBar isFullscreen={false} onToggleFullscreen={toggleFullscreen} />
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex min-w-0 flex-1 scrollbar-thin flex-col overflow-x-hidden overflow-y-auto"
          style={{
            paddingTop: "max(var(--space-lg), env(safe-area-inset-top, 0px))",
            paddingRight:
              "max(var(--space-xl), env(safe-area-inset-right, 0px))",
            paddingBottom:
              "max(var(--space-lg), env(safe-area-inset-bottom, 0px))",
            paddingLeft: "max(var(--space-xl), env(safe-area-inset-left, 0px))",
          }}
        >
          {children}
        </main>
      </div>
      <NoiseOverlay />
      <PostProcessingLayer />
    </div>
  );
}
