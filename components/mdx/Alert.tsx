import { Info, MessageSquareWarning, Siren, TriangleAlert } from "lucide-react";
import { Children, JSX } from "react";

import { AlertDescription, AlertTitle, Alert as ShadcnAlert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface BannerProps extends React.ComponentProps<typeof ShadcnAlert> {
  level?: number;
}

const levels = {
  info: 1,
  warning: 2,
  danger: 3,
} as const;

export function Alert({ children, level, ...props }: BannerProps) {
  const isInfo = level === levels.info;
  const isWarning = level === levels.warning;
  const isDanger = level === levels.danger;

  const [title, ...description] =
    Children.map(
      children,
      (child) => (Children.toArray(child)?.[0] as JSX.Element).props.children,
    ) ?? [];

  return (
    <ShadcnAlert
      className={cn("my-5", {
        "border-blue-200 bg-blue-50 text-blue-800 *:data-[slot=alert-description]:text-blue-800/90 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200 dark:*:data-[slot=alert-description]:text-blue-200/90 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400":
          isInfo,
        "border-yellow-200 bg-yellow-50 text-yellow-800 *:data-[slot=alert-description]:text-yellow-800/90 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 dark:*:data-[slot=alert-description]:text-yellow-200/90 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400":
          isWarning,
        "border-rose-200 bg-rose-50 text-rose-800 *:data-[slot=alert-description]:text-rose-800/90 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200 dark:*:data-[slot=alert-description]:text-rose-200/90 [&>svg]:text-rose-600 dark:[&>svg]:text-rose-400":
          isDanger,
      })}
      {...props}
    >
      {isInfo ? <Info /> : isWarning ? <TriangleAlert /> : isDanger ? <Siren /> : null}
      <AlertTitle>{title}</AlertTitle>
      {Boolean(description.length) && (
        <AlertDescription>{description.flatMap((node) => [node, " "])}</AlertDescription>
      )}
    </ShadcnAlert>
  );
}
