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
    "[&_p]:first-letter:ml-3",
    // Italic
    "[&_em]:font-semibold",
    // Bold
    "[&_strong]:font-bold",
    // Sub
    "[&_sub]:text-muted-foreground",
    // Link
    "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline",
    // Code
    "prose-pre:max-h-[calc(var(--spacing)_*_100)]",
    // Image
    "prose-img:w-full",
    // Inline code
    "prose-p:[&_code]:before:hidden",
    "prose-p:[&_code]:after:hidden",
    "prose-p:[&_code]:bg-muted prose-p:[&_code]:border prose-p:[&_code]:rounded-sm prose-p:[&_code]:px-1 prose-p:[&_code]:py-0.5 prose-p:[&_code]:text-sm prose-p:[&_code]:font-mono prose-p:[&_code]:font-normal",
    // Task
    "prose-ol:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
    "prose-ul:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
    // Table
    "prose-table:m-0",
    "prose-td:[&>figure]:m-auto",
    // footnote
    "[&_section.footnotes]:mt-24 [&_section.footnotes]:border-t",
    "[&_section.footnotes>ol_li_p]:first-letter:!ml-0 [&_section.footnotes>ol_li_p]:!my-1 [&_section.footnotes>ol_li]:text-sm",
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
        "relative flex h-[calc(100dvh_-_var(--spacing)_*_10)] w-full scroll-pt-18 overflow-auto lg:justify-center xl:scroll-pt-8",
        className,
      )}
      {...props}
    />
  );
}
