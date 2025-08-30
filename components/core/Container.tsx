import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full scroll-pt-8 overflow-auto lg:justify-center",
        className,
      )}
      {...props}
    />
  );
}
