"use client";

import { useActiveAnchor } from "fumadocs-core/toc";
import { useEffectEvent } from "fumadocs-core/utils/use-effect-event";
import { ChevronDown } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TOCScrollArea, useTOCItems } from "@/components/fumadocs/toc";
import ClerkTOCItems from "@/components/fumadocs/toc-clerk";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSidebar } from "@/components/ui/sidebar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

const TocPopoverContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function PageTOCPopover(props: React.ComponentProps<"div">) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { state } = useSidebar();
  // const { isTransparent } = useNav();

  const onClick = useEffectEvent((e: Event) => {
    if (!open) return;

    if (ref.current && !ref.current.contains(e.target as HTMLElement)) setOpen(false);
  });

  useEffect(() => {
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [onClick]);

  return (
    <TocPopoverContext.Provider
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [setOpen, open],
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen} asChild>
        <header
          ref={ref}
          id="nd-tocnav"
          {...props}
          className={cn(
            "fixed z-10 border-b backdrop-blur-sm transition-all duration-200 ease-linear max-xl:h-[40px] xl:hidden",
            open && "bg-background/80 shadow-lg",
            props.className,
          )}
          style={{
            ...props.style,
            insetInlineStart: state === "collapsed" ? 0 : "256px",
            insetInlineEnd: 5,
          }}
        >
          {props.children}
        </header>
      </Collapsible>
    </TocPopoverContext.Provider>
  );
}

export function PageTOCPopoverTrigger({
  lng: lngParam,
  ...props
}: React.ComponentProps<"button"> & { lng: Language }) {
  const { t } = useTranslation(lngParam);
  const { open } = useContext(TocPopoverContext);
  const items = useTOCItems();
  const active = useActiveAnchor();
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active],
  );
  const showItem = selected !== -1 && !open;

  return (
    <CollapsibleTrigger
      {...props}
      className={cn(
        "flex h-[40px] w-full items-center gap-2.5 px-4 py-2.5 text-start text-muted-foreground text-sm focus-visible:outline-none md:px-6 [&_svg]:size-4",
        props.className,
      )}
    >
      <ProgressCircle
        value={(selected + 1) / Math.max(1, items.length)}
        max={1}
        className={cn("shrink-0", open && "text-primary")}
      />
      <span className="grid flex-1 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={cn(
            "truncate transition-all",
            open && "text-foreground",
            showItem && "-translate-y-full pointer-events-none opacity-0",
          )}
        >
          {t("toc")}
        </span>
        <span
          className={cn(
            "truncate transition-all",
            !showItem && "pointer-events-none translate-y-full opacity-0",
          )}
        >
          {items[selected]?.title}
        </span>
      </span>
      <ChevronDown className={cn("mx-0.5 shrink-0 transition-transform", open && "rotate-180")} />
    </CollapsibleTrigger>
  );
}

interface ProgressCircleProps extends Omit<React.ComponentProps<"svg">, "strokeWidth"> {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) return min;
  if (input > max) return max;
  return input;
}

function ProgressCircle({
  value,
  strokeWidth = 2,
  size = 24,
  min = 0,
  max = 100,
  ...restSvgProps
}: ProgressCircleProps) {
  const normalizedValue = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / max) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      {...restSvgProps}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}

export function PageTOCPopoverContent(props: React.ComponentProps<"div">) {
  return (
    <CollapsibleContent
      data-toc-popover=""
      {...props}
      className={cn("flex max-h-[50vh] flex-col px-4 md:px-6", props.className)}
    >
      {props.children}
    </CollapsibleContent>
  );
}

export function PageTOCPopoverItems({
  lng: lngParam,
  variant = "normal",
  ...props
}: React.ComponentProps<"div"> & { lng: Language; variant?: "clerk" | "normal" }) {
  return (
    <TOCScrollArea {...props}>
      <ClerkTOCItems lng={lngParam} />
    </TOCScrollArea>
  );
}
