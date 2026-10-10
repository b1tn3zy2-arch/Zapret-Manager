import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";

import { ANIMATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface PlayOverlayProps {
  isRunning: boolean;
  isBusy: boolean;
  motionDisabled: boolean;
  onRun: () => void;
  onStop: () => void;
}

export default function PlayOverlay({
  isRunning,
  isBusy,
  motionDisabled,
  onRun,
  onStop,
}: PlayOverlayProps) {
  const handleClick = (event: React.MouseEvent): void => {
    event.stopPropagation();

    if (isBusy) {
      return;
    }

    if (isRunning) {
      onStop();
      return;
    }

    onRun();
  };

  return (
    <motion.span
      initial={motionDisabled ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
        "rounded-xl bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      )}
    >
      <motion.button
        type="button"
        disabled={isBusy}
        aria-label={isRunning ? "Остановить стратегию" : "Запустить стратегию"}
        onClick={handleClick}
        whileHover={motionDisabled ? { scale: 1 } : { scale: 1.1 }}
        whileTap={motionDisabled ? { scale: 1 } : { scale: 0.95 }}
        transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
        className={cn(
          "pointer-events-auto flex size-14 items-center justify-center rounded-full",
          "text-on-accent shadow-lg transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isRunning ? "bg-accent-danger" : "bg-accent-primary"
        )}
      >
        {isRunning ? (
          <Square
            aria-hidden="true"
            className="size-6"
            strokeWidth={2.5}
            fill="currentColor"
          />
        ) : (
          <Play
            aria-hidden="true"
            className="size-6 translate-x-0.5"
            strokeWidth={2.5}
            fill="currentColor"
          />
        )}
      </motion.button>
    </motion.span>
  );
}
