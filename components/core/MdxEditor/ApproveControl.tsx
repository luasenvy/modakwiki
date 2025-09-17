"use client";

import debounce from "lodash.debounce";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface ApproveControlProps {
  lng: Language;
}

export function ApproveControl({ lng: lngParam }: ApproveControlProps) {
  const { t } = useTranslation(lngParam);

  const router = useRouter();
  const [reason, setReason] = useState<string>("");

  const handleClickRejectDocument = async (reason: string) => {
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    };
    const res = await fetch("/api/document/approval", options);

    if (!res.ok) return toast.error(await statusMessage({ t, res, options }));

    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        className="hover:!text-green-600 size-6 text-green-500"
        size="icon"
        title={t("Approve Document")}
      >
        <CircleCheck className="size-3.5" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:!text-rose-600 size-6 text-rose-500">
            <CircleCheck className="size-3.5 text-orange-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Reject Document")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This document cannot be approved.")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Input
              name="reason"
              placeholder={t("Reason for rejection")}
              defaultValue={reason}
              onChange={debounce((e) => setReason(e.target.value), 110)}
              onKeyDown={(e) => e.stopPropagation()}
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleClickRejectDocument(reason);
              }}
            >
              {t("Save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
