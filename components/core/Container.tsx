import { cn } from "@/lib/utils";

export async function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-full px-4 pt-8 lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
        "h-fit break-keep pb-24",
        className,
      )}
      {...props}
    />
  );
}
