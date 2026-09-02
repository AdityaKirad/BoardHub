export function CreateCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="group relative block h-2 w-full"
      type="button"
      onClick={onClick}>
      <hr className="group-hover:border-border -inset-x-2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-transparent transition-colors" />
      <div className="bg-muted after:bg-muted-foreground before:bg-muted-foreground absolute top-1/2 left-1/2 h-4 w-6 -translate-x-1/2 -translate-y-1/2 rounded opacity-0 transition-opacity group-hover:opacity-100 before:absolute before:top-1/2 before:left-1/2 before:h-2.5 before:w-[1.5px] before:-translate-x-1/2 before:-translate-y-1/2 after:absolute after:top-1/2 after:left-1/2 after:h-[1.5px] after:w-2.5 after:-translate-x-1/2 after:-translate-y-1/2" />
    </button>
  );
}
