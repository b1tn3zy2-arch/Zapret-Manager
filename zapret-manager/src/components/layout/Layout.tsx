import type { ReactNode } from "react";
import { useRef } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TitleBar from "@/components/layout/TitleBar";
import NoiseOverlay from "@/components/shared/NoiseOverlay";
import PostProcessingLayer from "@/components/shared/PostProcessingLayer";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useSmoothWheelScroll } from "@/hooks/useSmoothWheelScroll";

export interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isFullscreen } = useFullscreen();
  const scrollRef = useRef<HTMLElement>(null);

  useSmoothWheelScroll(scrollRef);

  return (
    <div className="bg-bg-primary flex h-screen w-screen flex-col overflow-hidden">
      {isFullscreen ? null : <TitleBar />}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main
          ref={scrollRef}
          className="scroll-thin flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
          style={{
            paddingTop: "max(var(--space-lg), env(safe-area-inset-top, 0px))",
            paddingRight:
              "max(var(--space-xl), env(safe-area-inset-right, 0px))",
            paddingBottom:
              "max(clamp(32px, 6vh, 96px), env(safe-area-inset-bottom, 0px))",
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
