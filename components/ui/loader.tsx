import { cn } from "@/lib/utils";
import { CustomStyle } from "@/lib/utils/components.util";

type Props = {
  label?: string;
};

export function Loader({ className, label }: CustomStyle<Props>) {
  return (
    <div className={cn("flex h-screen items-center justify-center", className)}>
      <div className="flex flex-col items-center justify-center gap-y-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-md text-primary">{label}</p>
      </div>
    </div>
  );
}
