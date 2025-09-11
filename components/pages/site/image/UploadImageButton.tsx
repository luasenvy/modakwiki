"use client";

import { ImageUp } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface UploadImageButtonProps {
  lng: Language;
  uploading: boolean;
  onSelect: (files: FileList) => void;
}

export function UploadImageButton({
  lng: lngParam,
  uploading,
  onSelect: handleSelect,
}: UploadImageButtonProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation(lngParam);

  const handleChangeUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) {
      e.target.value = "";
      return toast.error(t("An upload is already in progress."));
    }

    const files = e.target.files;
    if (!files?.length) return;

    handleSelect?.(files);
    e.target.value = "";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        className="rounded-none"
        onClick={() => uploadRef.current?.click()}
      >
        <ImageUp className="size-5" />
        {t("Upload Image")}
      </Button>

      <input
        ref={uploadRef}
        name="upload"
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleChangeUploadImage}
      />
    </>
  );
}
