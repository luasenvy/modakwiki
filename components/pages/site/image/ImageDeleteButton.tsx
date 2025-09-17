"use client";

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface ImageDeleteButtonProps {
  lng: Language;
  imageId: number;
}

export function ImageDeleteButton({ lng: lngParam, imageId }: ImageDeleteButtonProps) {
  const { t } = useTranslation(lngParam);
  const router = useRouter();

  const handleClickDeleteImage = async (imageId: number) => {
    const options = { method: "DELETE" };

    const res = await fetch(`/api/image?${new URLSearchParams({ id: String(imageId) })}`, options);

    if (!res.ok) return toast.error(await statusMessage({ t, res, options }));

    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash className="size-3.5" />
          {t("Delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Image")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("This action cannot be undone. This will delete data permanently.")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleClickDeleteImage(imageId);
            }}
          >
            {t("Save")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
