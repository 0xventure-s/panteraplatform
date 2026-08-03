interface PageLoadingProps {
  compact?: boolean;
}

export const PageLoading = ({ compact = false }: PageLoadingProps) => (
  <div
    className="mx-auto w-full max-w-7xl animate-pulse space-y-8 p-5 md:p-8 lg:p-10"
    aria-busy="true"
    aria-label="Cargando"
  >
    <div
      className={
        compact
          ? "h-44 rounded-[28px] bg-muted"
          : "h-72 rounded-[32px] bg-muted md:h-80"
      }
    />
    <div className="space-y-3">
      <div className="h-4 w-28 rounded-full bg-muted" />
      <div className="h-9 w-72 max-w-full rounded-xl bg-muted" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-56 rounded-[24px] border border-foreground/5 bg-muted/80"
        />
      ))}
    </div>
  </div>
);
