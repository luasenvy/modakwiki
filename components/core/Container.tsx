import { createElement } from "react";
import { SearchParamsScroller } from "@/components/core/SearchParamsScroller";
import { cn } from "@/lib/utils";

type AllowedComponent = "div" | "article";

const defaultContainerComponent = "div" as const;

const variants = {
  wide: "relative w-full max-w-full px-4 lg:max-w-[calc(var(--container-3xl)_+_286px)] xl:max-w-[calc(var(--container-4xl)_+_286px)] pt-8",
  aside:
    "relative pt-8 w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl h-fit pr-2 pl-4 max-lg:pr-4 space-y-14",
  document: cn(
    "relative",
    "w-full h-fit max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
    "pr-2 pl-4 pt-18 xl:pt-8 max-lg:pr-4",
    "break-keep",
    "prose dark:prose-invert",
    "[&>p]:first-letter:ml-3",
    // Sub
    "[&_sub]:text-muted-foreground",
    // Link
    "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
    // Code
    "prose-pre:max-h-[calc(var(--spacing)_*_100)]",
    // Image
    "prose-img:w-full",
    "prose-img:[&[alt*=width-4]]:max-w-4",
    "prose-img:[&[alt*=width-8]]:max-w-8",
    "prose-img:[&[alt*=width-12]]:max-w-12",
    "prose-img:[&[alt*=width-16]]:max-w-16",
    "prose-img:[&[alt*=width-20]]:max-w-20",
    "prose-img:[&[alt*=width-24]]:max-w-24",
    "prose-img:[&[alt*=width-28]]:max-w-28",
    "prose-img:[&[alt*=width-32]]:max-w-32",
    "prose-img:[&[alt*=width-36]]:max-w-36",
    "prose-img:[&[alt*=width-40]]:!max-w-40", // Avoid Duplicate with w-4
    "prose-img:[&[alt*=width-3xs]]:max-w-3xs",
    "prose-img:[&[alt*=width-2xs]]:max-w-2xs",
    "prose-img:[&[alt*=width-xs]]:max-w-xs",
    "prose-img:[&[alt*=width-sm]]:max-w-sm",
    "prose-img:[&[alt*=width-md]]:max-w-md",
    "prose-img:[&[alt*=width-lg]]:max-w-lg",
    "prose-img:[&[alt*=width-xl]]:max-w-xl",
    "prose-img:[&[alt*=width-2xl]]:max-w-2xl",
    "prose-img:[&[alt*=width-3xl]]:max-w-3xl",
    "prose-img:[&[alt*=width-4xl]]:max-w-4xl",
    "prose-img:[&[alt*=width-5xl]]:max-w-5xl",
    "prose-img:[&[alt*=width-6xl]]:max-w-6xl",
    "prose-img:[&[alt*=width-7xl]]:max-w-7xl",
    "prose-img:[&[alt*=height-4]]:max-h-4",
    "prose-img:[&[alt*=height-8]]:max-h-8",
    "prose-img:[&[alt*=height-12]]:max-h-12",
    "prose-img:[&[alt*=height-16]]:max-h-16",
    "prose-img:[&[alt*=height-20]]:max-h-20",
    "prose-img:[&[alt*=height-24]]:max-h-24",
    "prose-img:[&[alt*=height-28]]:max-h-28",
    "prose-img:[&[alt*=height-32]]:max-h-32",
    "prose-img:[&[alt*=height-36]]:max-h-36",
    "prose-img:[&[alt*=height-40]]:!max-h-40", // Avoid Duplicate with h-4
    "prose-img:[&[alt*=height-3xs]]:max-h-3xs",
    "prose-img:[&[alt*=height-2xs]]:max-h-2xs",
    "prose-img:[&[alt*=height-xs]]:max-h-xs",
    "prose-img:[&[alt*=height-sm]]:max-h-sm",
    "prose-img:[&[alt*=height-md]]:max-h-md",
    "prose-img:[&[alt*=height-lg]]:max-h-lg",
    "prose-img:[&[alt*=height-xl]]:max-h-xl",
    "prose-img:[&[alt*=height-2xl]]:max-h-2xl",
    "prose-img:[&[alt*=height-3xl]]:max-h-3xl",
    "prose-img:[&[alt*=height-4xl]]:max-h-4xl",
    "prose-img:[&[alt*=height-5xl]]:max-h-5xl",
    "prose-img:[&[alt*=height-6xl]]:max-h-6xl",
    "prose-img:[&[alt*=height-7xl]]:max-h-7xl",
    // Task
    "prose-ol:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
    "prose-ul:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
    // Table
    "prose-table:m-0",
    "prose-td:[&>img]:m-auto",
    // footnote
    "[&_section.footnotes]:mt-24 [&_section.footnotes]:border-t",
    "[&_section.footnotes>ol_li_p]:!my-1 [&_section.footnotes>ol_li]:text-sm",
    "[&_section.footnotes>ol_li[data-selected]]:repeat-3 [&_section.footnotes>ol_li[data-selected]]:animate-caret-blink [&_section.footnotes>ol_li[data-selected]]:text-rose-500",
    "[&_[data-footnote-ref=true][data-selected]]:repeat-3 [&_[data-footnote-ref=true][data-selected]]:animate-caret-blink [&_[data-footnote-ref=true][data-selected]]:text-rose-500",
    "prose-a:[&[data-footnote-ref]]:before:content-['[']",
    "prose-a:[&[data-footnote-ref]]:after:content-[']']",
  ),
} as const;

export function Container<T extends AllowedComponent = typeof defaultContainerComponent>({
  as,
  className,
  variant = "aside",
  ...props
}: React.ComponentProps<T> & { as?: T; variant?: keyof typeof variants }) {
  return createElement(as ?? defaultContainerComponent, {
    className: cn("pb-24", variants[variant], className),
    ...props,
  });
}

export function Viewport({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return (
    <SearchParamsScroller
      className={cn(
        "relative flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full scroll-pt-18 overflow-auto lg:justify-center xl:scroll-pt-8",
        className,
      )}
      {...props}
    />
  );
}
