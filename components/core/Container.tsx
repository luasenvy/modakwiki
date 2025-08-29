import { cn } from "@/lib/utils";

export async function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("max-w-full px-4 pt-8", "h-fit w-full break-keep pb-24", className)}
      {...props}
    />
  );
}
