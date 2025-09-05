import { createElement } from "react";
import { SearchParamsScroller } from "@/components/core/SearchParamsScroller";
import { cn } from "@/lib/utils";

type AllowedComponent = "div" | "article";

const defaultContainerComponent = "div" as const;

export function Container<T extends AllowedComponent = typeof defaultContainerComponent>({
  as,
  className,
  ...props
}: React.ComponentProps<T> & { as?: T }) {
  return createElement(as ?? defaultContainerComponent, {
    className: cn("pt-8 pb-24", className),
    ...props,
  });
}

export function Viewport({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return (
    <>
      <SearchParamsScroller
        className={cn(
          "relative flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full scroll-pt-8 overflow-auto lg:justify-center",
          className,
        )}
        {...props}
      />
    </>
  );
}
