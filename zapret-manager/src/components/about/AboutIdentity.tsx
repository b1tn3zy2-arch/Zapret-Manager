import { Shield } from "lucide-react";

import { Badge, Heading, Text } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

export interface AboutIdentityProps {
  appVersion: string;
  resourcesVersion: string;
  resourcesLabel: string;
}

export default function AboutIdentity({
  appVersion,
  resourcesVersion,
  resourcesLabel,
}: AboutIdentityProps) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="text-accent-primary bg-accent-primary/10 flex size-12 shrink-0 items-center justify-center rounded-xl"
          aria-hidden="true"
        >
          <Shield className="size-7" strokeWidth={2} />
        </span>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={1}>{APP_NAME}</Heading>
            <Badge variant="neutral">{appVersion}</Badge>
          </div>
          <Text variant="body" size="sm" className="text-text-secondary">
            By: Ivan Grafov
          </Text>
          <Text variant="body" size="sm" className="text-text-secondary">
            {resourcesLabel} {resourcesVersion}
          </Text>
        </div>
      </div>
    </header>
  );
}
