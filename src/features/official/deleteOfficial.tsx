import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";


interface Props {
  ID: number;
  Name: string;
  onDelete: () => void;
}

export default function DeleteOfficialModal({ ID, Name, onDelete }: Props) {
  async function onConfirm() {
    try {
      await invoke("delete_official_command", { ID });
      toast.success("Official deleted", {
        description: `${Name} was deleted.`,
      });
      onDelete();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete official");
      console.error(error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <XIcon />
          Delete Official
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-black font-normal">Official Deletion</DialogTitle>
          <DialogDescription className="text-sm font-bold">
            This action cannot be undone once confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="text-black text-lg font-bold">
          Are you sure you want to delete this official?
        </div>
        <div className="flex w-full gap-3 justify-end">
          <DialogClose asChild>
            <Button variant="ghost" className="text-black">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm Delete
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
