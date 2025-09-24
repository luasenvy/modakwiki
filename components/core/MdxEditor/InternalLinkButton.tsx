"use client";

import { Link2 } from "lucide-react";
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
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";

interface DocumentSelectButtonProps {
  lng: Language;
  onSelect?: (document: DocumentType & { type: Doctype }) => void;
}

export function InternalLinkButton({
  lng: lngParam,
  onSelect: handleSelect,
}: DocumentSelectButtonProps) {
  const [documents, setDocuments] = useState<Array<DocumentType & { type: Doctype }>>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { t } = useTranslation(lngParam);

  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      const res = await fetch(`/api/document`);
      setLoading(false);

      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setDocuments(await res.json());
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
          <Link2 className="size-5" />
          {t("Select Document")}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:!max-w-2xl lg:!max-w-4xl xl:!max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("Select Document")}</DialogTitle>
          <DialogDescription>{t("You can select a document")}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="max-h-[calc(100dvh_-_(var(--spacing)_*_40))] py-6">
            <Spinner className="mx-auto" variant="ring" size={32} />
          </div>
        ) : (
          <div className="max-h-[calc(100dvh_-_(var(--spacing)_*_40))] space-y-1 overflow-y-auto">
            {documents.map((document) => (
              <div key={`document-${document.id}`}>
                <Button
                  type="button"
                  variant="link"
                  className="py-0 hover:bg-accent"
                  onClick={() => {
                    handleSelect?.(document);
                    setOpen(false);
                  }}
                >
                  {document.title}{" "}
                  <sub>
                    (
                    {t(
                      Object.entries(doctypeEnum).find(([, value]) => value === document.type)![0],
                    )}
                    )
                  </sub>
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
