"use client";

import { useRouter } from "next/navigation";
import { deleteShortLink } from "~/server/actions/link";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

type DeleteLinkDialogProps = {
  slug: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export const DeleteLinkDialog = ({
  slug,
  isOpen,
  onOpenChange,
}: DeleteLinkDialogProps) => {
  const router = useRouter();
  const { execute: deleteLink, status: deleteLinkStatus } = useAction(
    deleteShortLink,
    {
      onSuccess() {
        toast.info("Link berhasil dihapus");
        onOpenChange?.(false);
        // Refresh untuk memastikan UI ter-update dengan data terbaru
        router.refresh();
      },
      onError(error) {
        const errorMessage = error.serverError ?? error.fetchError ?? "Gagal menghapus link";
        toast.error(errorMessage);
        console.error("Delete link error:", error);
      },
    },
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[22rem] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Aksi ini tidak bisa dibatalkan. Link akan dihapus permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteLink({ slug })}
            isLoading={deleteLinkStatus === "executing"}
          >
            {deleteLinkStatus === "executing"
              ? "Menghapus link..."
              : "Hapus link"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
