"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface CopyButtonProps {
  lng: Language;
  content: string;
}

export function CopyButton({ lng: lngParam, content }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const { t } = useTranslation(lngParam);

  const handleClickCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="!text-muted-foreground hover:!text-foreground size-6"
      size="icon"
      title={t("Copy to clipboard")}
      onClick={handleClickCopy}
      disabled={!content}
    >
      {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
