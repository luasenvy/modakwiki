import { Info, Siren, TriangleAlert } from "lucide-react";
import { Children, JSX } from "react";

import { AlertDescription, AlertTitle, Alert as ShadcnAlert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface BannerProps extends React.ComponentProps<typeof ShadcnAlert> {
  level?: string;
}

const levels = {
  info: "1",
  warning: "2",
  danger: "3",
} as const;

export function Alert({ children, level, ...props }: BannerProps) {
  const isInfo = level === levels.info;
  const isWarning = level === levels.warning;
  const isDanger = level === levels.danger;

  const [title, ...descriptions] =
    Children.map(
      children,
      (child) => (Children.toArray(child)?.[0] as JSX.Element).props.children,
    ) ?? [];

  return (
    <ShadcnAlert
      className={cn("my-5", {
        "border-blue-200 bg-blue-50 text-blue-800 *:data-[slot=alert-description]:text-blue-800/90 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200 dark:*:data-[slot=alert-description]:text-blue-200/90 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400":
          isInfo,
        "border-orange-200 bg-orange-50 text-orange-800 *:data-[slot=alert-description]:text-orange-800/90 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 dark:*:data-[slot=alert-description]:text-yellow-200/90 [&>svg]:text-orange-600 dark:[&>svg]:text-yellow-400":
          isWarning,
        "border-rose-200 bg-rose-50 text-rose-800 *:data-[slot=alert-description]:text-rose-800/90 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200 dark:*:data-[slot=alert-description]:text-rose-200/90 [&>svg]:text-rose-600 dark:[&>svg]:text-rose-400":
          isDanger,
      })}
      {...props}
    >
      {isInfo ? <Info /> : isWarning ? <TriangleAlert /> : isDanger ? <Siren /> : null}
      <AlertTitle className={cn({ "mb-1": Boolean(descriptions.length) })}>{title}</AlertTitle>
      {Boolean(descriptions.length) && (
        <AlertDescription>
          {descriptions.map((description, i) => (
            <p key={`alert-desc-${i}`} className="!m-0">
              {description}
            </p>
          ))}
        </AlertDescription>
      )}
    </ShadcnAlert>
  );
}
