import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { ANIMATION, GAME_OVERLAY_SCRIM } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface GamePlayOverlayProps {
  visible: boolean;
  busy: boolean;
  label: string;
  motionDisabled: boolean;
  onLaunch: () => void;
}

export default function GamePlayOverlay({
  visible,
  busy,
  label,
  motionDisabled,
  onLaunch,
}: GamePlayOverlayProps) {
  return (
    <span
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl",
        "transition-opacity duration-100",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <span
        className="absolute inset-0 rounded-xl backdrop-blur-md"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, ${GAME_OVERLAY_SCRIM})`,
        }}
      />
      <motion.button
        type="button"
        disabled={busy || !visible}
        tabIndex={visible ? 0 : -1}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          onLaunch();
        }}
        initial={motionDisabled ? false : { scale: 0.82, opacity: 0.6 }}
        animate={{ scale: visible ? 1 : 0.82, opacity: visible ? 1 : 0.6 }}
        {...(motionDisabled
          ? {}
          : { whileHover: { scale: 1.08 }, whileTap: { scale: 0.95 } })}
        transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto relative flex size-[72px] items-center justify-center rounded-full",
          "bg-accent-primary/85 text-on-accent border-2 border-white/20 backdrop-blur-md",
          "shadow-[0_0_40px_rgb(var(--color-accent-primary-rgb)/0.45)]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <Play
          aria-hidden="true"
          className="size-8 translate-x-0.5"
          strokeWidth={2.5}
          fill="currentColor"
        />
      </motion.button>
    </span>
  );
}
