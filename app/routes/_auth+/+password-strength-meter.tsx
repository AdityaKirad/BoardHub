import { cn } from "~/lib/utils";

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-green-950",
];

export function PasswordStrengthMeter({ score }: { score: number }) {
  return (
    <div className="relative h-1 w-full">
      <div className="absolute inset-0 flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={`base-${index}`}
            className="bg-border h-full flex-1 rounded-full"
          />
        ))}
      </div>

      <div
        className="absolute inset-0 flex gap-1 transition-all ease-out"
        style={{
          clipPath:
            score === -1
              ? "inset(0 100% 0 0)"
              : `inset(0 ${100 - (score + 1) * 20}% 0 0)`,
        }}>
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-full flex-1 rounded-full transition-colors",
              colors[score],
            )}
          />
        ))}
      </div>
    </div>
  );
}
