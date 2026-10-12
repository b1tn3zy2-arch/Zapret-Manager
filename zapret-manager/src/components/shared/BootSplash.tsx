import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function BootSplash() {
  return (
    <motion.div
      aria-hidden="true"
      className="bg-bg-primary fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.span
        className="text-accent-primary bg-accent-primary/10 flex size-20 items-center justify-center rounded-3xl"
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          delay: 0.05,
        }}
      >
        <Shield className="size-11" strokeWidth={1.8} />
      </motion.span>

      <motion.span
        className="text-text-primary text-lg font-semibold tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        {APP_NAME}
      </motion.span>

      <motion.span
        className="bg-accent-primary absolute bottom-0 left-0 h-[2px]"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
    </motion.div>
  );
}
