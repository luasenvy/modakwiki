"use client";

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

import { BrushCleaning, Check, Copy, History, Save, Shredder } from "lucide-react";

import { TFunction } from "i18next";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RemoconProps extends React.ComponentProps<"div"> {
  t: TFunction;
  savable?: boolean;
  copiable?: boolean;
  resetable?: boolean;
  clearable?: boolean;
  deletable?: boolean;
  content?: string;
  onSave?: () => void;
  onClear?: () => void;
  onUndoAll?: () => void;
  onDelete?: () => void;
}

export function Remocon({
  t,
  savable,
  copiable,
  resetable,
  clearable,
  deletable,
  className,
  content,
  onSave: handleSave,
  onClear: handleClear,
  onUndoAll: handleUndoAll,
  onDelete: handleDelete,
}: RemoconProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleClickCopy = () => {
    navigator.clipboard.writeText(content || "").then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  return (
    <div
      className={cn(
        "mt-auto mb-4 flex items-center justify-around rounded-lg border bg-background px-4 py-1",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          className="!text-muted-foreground hover:!text-foreground size-6"
          size="icon"
          title={t("Save Document")}
          onClick={handleSave}
          disabled={!savable}
        >
          <Save className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="!text-muted-foreground hover:!text-foreground size-6"
          size="icon"
          title={t("Copy to clipboard")}
          onClick={handleClickCopy}
          disabled={!copiable}
        >
          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="!text-orange-500/80 hover:!text-orange-500 size-6"
              size="icon"
              title={t("Clear Document")}
              disabled={!clearable}
            >
              <BrushCleaning className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  "This action cannot be undone. Removes all content from the document you are currently editing.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>{t("Yes, I'm sure")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="!text-orange-500/80 hover:!text-orange-500 size-6"
              size="icon"
              title={t("Erase Changes")}
              disabled={!resetable}
            >
              <History className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  "This action cannot be undone. Discard all changes and return to initial state.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleUndoAll}>{t("Yes, I'm sure")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {deletable && (
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="!text-destructive/80 hover:!text-destructive size-6"
                size="icon"
                title={t("Delete Document")}
              >
                <Shredder className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("This action cannot be undone. This will delete document permanently.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t("Yes, I'm sure")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
