"use client";

import debounce from "lodash.debounce";
import { ImageUp } from "lucide-react";
import { ForwardedRef, forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { License as LicenseInput } from "@/components/core/input/License";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { License, licenseEnum } from "@/lib/license";
import { ImageDescriptionForm } from "@/lib/schema/image";
import { cn } from "@/lib/utils";

interface ImageUploadButtonProps {
  lng: Language;
  uploadingState: [boolean, (uploading: boolean) => void];
  onSave: (res: Response) => void;
}

export async function uploadImage(files: FileList) {
  const formData = new FormData();

  for (const file of files) formData.append("files", file);

  const options = { method: "POST", body: formData };

  return fetch("/api/image", options);
}

export interface ImageUploadAPI {
  upload: (files: FileList) => Promise<Response>;
}

export const ImageUploadButton = forwardRef(function (
  { lng: lngParam, uploadingState, onSave: handleSave }: ImageUploadButtonProps,
  ref: ForwardedRef<ImageUploadAPI>,
) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [uploading, setUploading] = uploadingState;

  const filesRef = useRef<FileList | null>(null);
  const filesFormRef = useRef<ImageDescriptionForm[]>([]);
  const uploadResolver = useRef<((value: Response) => void) | null>(null);
  const uploadRejector = useRef<((err: Error) => void) | null>(null);

  const { t } = useTranslation(lngParam);

  const handleChangeUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) {
      e.target.value = "";
      return toast.error(t("An upload is already in progress."));
    }

    const files = e.target.files;
    if (!files?.length) return;

    const promise = handleSave(await upload(files));

    e.target.value = "";

    return promise;
  };

  const handleClickSave = async () => {
    if (!filesRef.current?.length) return toast.error(t("No files to upload."));
    if (uploading) return toast.error(t("An upload is already in progress."));

    const formData = new FormData();

    filesFormRef.current!.forEach(({ license, author, ref }) => {
      formData.append("license", license);
      formData.append("author", author);
      formData.append("ref", ref || "");
    });

    for (const file of filesRef.current) formData.append("files", file);

    const options = { method: "POST", body: formData };

    try {
      setUploading(true);
      const res = await fetch("/api/image", options);
      if (!res.ok) {
        const message = await statusMessage({ t, res, options });
        toast.error(message);
        throw new Error(message);
      }
      setOpen(false);

      uploadResolver.current!(res);
    } catch (err) {
      uploadRejector.current!(err as Error);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const upload = (files: FileList): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
      if (!files.length) return reject(t("No files to upload."));
      if (uploading) return reject(t("An upload is already in progress."));

      filesRef.current = files;
      filesFormRef.current = Array.from(
        { length: files.length },
        () => ({ license: licenseEnum.ccbysa }) as ImageDescriptionForm,
      );

      setOpen(true);

      uploadResolver.current = resolve;
      uploadRejector.current = reject;
    });
  };

  useImperativeHandle(ref, () => ({
    upload,
  }));

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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Image description")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("You must input a description for the image before uploading.")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-[calc(100dvh_-_var(--spacing)_*_60)] space-y-4 overflow-y-auto overflow-x-hidden">
            {filesRef.current &&
              Array.from(filesRef.current).map((file, i) => (
                <div key={i} className="flex gap-1">
                  <ImagePreview file={file} className="w-1/3" />

                  <div className="w-2/3 space-y-1 p-1">
                    <Input
                      className="rounded-none"
                      type="text"
                      placeholder={t("copyrighter")}
                      defaultValue={filesFormRef.current![i].author || ""}
                      onChange={debounce((e) => {
                        filesFormRef.current![i].author = e.target.value;
                      }, 110)}
                    />
                    <LicenseInput
                      className="[&>span]:!inline w-full rounded-none [&>span]:line-clamp-1 [&>span]:truncate"
                      defaultValue={filesFormRef.current![i].license || licenseEnum.ccbysa}
                      onValueChange={(e) => {
                        filesFormRef.current![i].license = e as License;
                      }}
                    />
                    <Input
                      className="rounded-none"
                      type="text"
                      placeholder={t("reference url")}
                      defaultValue={filesFormRef.current![i].ref || ""}
                      onChange={debounce((e) => {
                        filesFormRef.current![i].ref = e.target.value;
                      }, 110)}
                    />
                  </div>
                </div>
              ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleClickSave();
              }}
            >
              {t("Save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

interface ImagePreviewProps extends React.ComponentProps<"div"> {
  file: File;
}

function ImagePreview({ file, className, ...props }: ImagePreviewProps) {
  const imageData = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <div
      {...props}
      className={cn("group flex items-end border bg-center bg-cover shadow-sm", className)}
      style={{
        backgroundImage: `url(${imageData})`,
      }}
    >
      <p className="bg-muted py-1 font-semibold text-muted-foreground text-shadow-sm text-xs opacity-40 transition-opacity duration-200 ease-linear group-hover:opacity-100">
        {file.name}
      </p>
    </div>
  );
}
