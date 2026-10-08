import type { ReactNode } from "react";

import PostProcessingProvider from "@/contexts/PostProcessingProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <PostProcessingProvider>{children}</PostProcessingProvider>;
}
