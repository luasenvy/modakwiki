import { cn } from "@/lib/utils";

export async function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("h-fit w-full max-w-full break-keep", className)} {...props} />;
}
