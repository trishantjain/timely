export default function Navbar() {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>

        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
          Task Manager
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">Admin</p>

          <p className="text-xs text-muted-foreground">Manage your workspace</p>
        </div>

        <div className="flex items-center justify-center text-sm font-semibold rounded-full h-9 w-9 bg-secondary text-secondary-foreground">
          A
        </div>
      </div>
    </header>
  );
}
