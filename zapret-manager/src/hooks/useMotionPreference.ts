import { useMemo } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";

export interface MotionPreference {
  enabled: boolean;
  reduced: boolean;
}

export function useMotionPreference(): MotionPreference {
  const animations = useSettingsStore(
    (state) => state.settings.appearance.animations
  );

  return useMemo(
    () => ({ enabled: animations, reduced: !animations }),
    [animations]
  );
}
