import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingModal({
  isOpen,
  message = "กำลังโหลด...",
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-[300px]">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader className="h-8 w-8" />
          <p className="text-center text-sm text-muted-foreground">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 