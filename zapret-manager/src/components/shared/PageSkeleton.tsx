import { Card, Skeleton } from "@/components/ui";

const PANEL_HEIGHTS = ["h-32", "h-24", "h-40"] as const;

function PageSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="flex flex-col gap-6"
    >
      <span className="sr-only">Загрузка страницы</span>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PANEL_HEIGHTS.map((height, index) => (
          <Card
            key={height + index.toString()}
            padding="lg"
            className="flex flex-col gap-3"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton variant="rect" height={height} />
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PageSkeleton;
