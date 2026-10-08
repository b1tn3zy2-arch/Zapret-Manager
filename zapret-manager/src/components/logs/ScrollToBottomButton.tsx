import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui";
import { ANIMATION } from "@/lib/constants";

export interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
}

function ScrollToBottomButton({ visible, onClick }: ScrollToBottomButtonProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="scroll-to-bottom"
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 8 }}
          transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
          className="absolute right-6 bottom-6 z-20"
        >
          <Button
            size="icon"
            aria-label="Прокрутить к последним логам"
            title="Прокрутить вниз"
            onClick={onClick}
            icon={<ArrowDown className="size-4" />}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ScrollToBottomButton;
