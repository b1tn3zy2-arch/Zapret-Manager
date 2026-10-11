import { useI18n } from "@/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui";
import { ANIMATION } from "@/lib/constants";

export interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
}

function ScrollToBottomButton({ visible, onClick }: ScrollToBottomButtonProps) {
  const { t } = useI18n();
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
            aria-label={t("logs.scrollAria")}
            title={t("logs.scrollTitle")}
            onClick={onClick}
            icon={<ArrowDown className="size-4" />}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ScrollToBottomButton;
