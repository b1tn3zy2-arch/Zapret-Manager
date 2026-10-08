import type { ReactNode } from "react";
import { motion } from "framer-motion";

import SettingsNav from "@/components/settings/SettingsNav";
import { ANIMATION } from "@/lib/constants";
import type { SettingsSection } from "@/types";

import type { Translate } from "@/i18n";

export interface SettingsLayoutProps {
  active: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  sectionKey: string;
  t: Translate;
  children: ReactNode;
}

function SettingsLayout({
  active,
  onSectionChange,
  sectionKey,
  t,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:gap-6">
      <SettingsNav active={active} onChange={onSectionChange} t={t} />

      <div className="min-w-0 flex-1">
        <motion.div
          key={sectionKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION.fast, ease: ANIMATION.easeOutExpo }}
          className="flex flex-col gap-4"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default SettingsLayout;
