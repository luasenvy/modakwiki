"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Image as ImageType } from "@/lib/schema/image";

interface UploadImageButtonProps {
  lng: Language;
  onSelect?: (image: ImageType) => void;
}

export function ImageSelectButton({
  lng: lngParam,
  onSelect: handleSelect,
}: UploadImageButtonProps) {
  const [images, setImages] = useState<Array<ImageType>>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { t } = useTranslation(lngParam);

  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/image`);
      setLoading(false);

      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setImages(await res.json());
    })();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="rounded-none"
          onClick={() => setOpen(true)}
        >
          <Images className="size-5" />
          {t("Select Image")}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:!max-w-2xl lg:!max-w-4xl xl:!max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("Select Image")}</DialogTitle>
          <DialogDescription>{t("You can select an image")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="max-h-[calc(100dvh_-_(var(--spacing)_*_40))] py-6">
            <Spinner className="mx-auto" variant="ring" size={32} />
          </div>
        ) : (
          <div className="grid max-h-[calc(100dvh_-_(var(--spacing)_*_40))] gap-1 overflow-y-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((image) => (
              <div
                key={`image-${image.id}`}
                className="relative flex h-[200px] flex-col justify-end border border-border bg-center bg-cover p-2 hover:bg-accent sm:h-[150px] lg:h-[200px]"
                style={{
                  cursor: "pointer",
                  backgroundImage: `url('/api/image${image.uri}-t')`,
                }}
                onClick={() => {
                  handleSelect?.(image);
                  setOpen(false);
                }}
              >
                <p className="truncate text-center text-shadow-sm text-sm text-white">
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
