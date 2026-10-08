import { useUpdateStore } from "@/stores/useUpdateStore";
import { cn } from "@/lib/utils";

function UpdateBadge() {
  const info = useUpdateStore((state) =>
    state.status === "available" && !state.isDismissed ? state.info : null
  );

  if (info === null) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      title={`Доступно обновление стратегий до ${info.latestVersion}`}
      className={cn(
        "text-bg-bg text-accent-primary absolute -top-1 -right-1 z-10",
        "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
        "ring-bg-bg-secondary ring-2"
      )}
    >
      <span className="bg-accent-primary absolute inset-0 animate-ping rounded-full opacity-60" />
      <span className="relative">↓</span>
    </span>
  );
}

export default UpdateBadge;
