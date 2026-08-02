import { cn } from "~/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type: _type, ...props }, ref) => {
  const [visible, visibleSet] = useState(false);
  return (
    <div
      className="border-input ring-offset-background focus-within:border-ring focus-within:ring-ring/50 [&>input:aria-invalid]:border-destructive [&>input:aria-invalid]:ring-destructive/20 dark:bg-input/30 dark:[&>input:aria-invalid]:border-destructive/50 dark:[&>input:aria-invalid]:ring-destructive/40 flex h-8 items-center gap-2 rounded-lg border px-2.5 transition-colors focus-within:ring-3 [&>input:aria-invalid]:ring-3"
      data-slot="password-input">
      <input
        className={cn(
          "placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none",
          className,
        )}
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        ref={ref}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        className="ring-offset-background focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={() => visibleSet((prevState) => !prevState)}
        title={visible ? "Hide" : "Reveal"}
        type="button">
        {visible ? (
          <>
            <EyeOff aria-hidden={true} />
            <span className="sr-only">Hide</span>
          </>
        ) : (
          <>
            <Eye aria-hidden={true} />
            <span className="sr-only">Reveal</span>
          </>
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
