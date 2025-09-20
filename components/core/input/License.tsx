"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n/react";
import { licenseEnum } from "@/lib/license";
import { cn } from "@/lib/utils";

interface LicenseProps extends React.ComponentProps<typeof Select> {
  className?: React.ComponentProps<typeof SelectTrigger>["className"];
}

export function License({ className, ...props }: LicenseProps) {
  const { t } = useTranslation();

  return (
    <Select {...props}>
      <SelectTrigger className={cn("rounded-none", className)}>
        <SelectValue placeholder={t("Select a license")} />
      </SelectTrigger>
      <SelectContent>
        {Object.values(licenseEnum).map((value) => (
          <SelectItem key={value} value={value}>
            {t(value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
