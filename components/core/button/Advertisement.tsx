import { RollingText } from "@/components/ui/shadcn-io/rolling-text";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdvertisementProps {
  className?: React.ComponentProps<"div">["className"];
}

export function Advertisement({ className }: AdvertisementProps) {
  return (
    <a href="mailto:luas.envy@gmail.com" target="_blank" rel="noopener noreferrer">
      <Skeleton
        className={cn(
          "hover:animation-duration-[0s] flex w-full cursor-pointer rounded-xl border bg-muted px-4 py-12 text-muted-foreground shadow-sm",
          className,
        )}
      >
        <RollingText
          text="Advertisement"
          className="mx-auto"
          inViewOnce={false}
          transition={{
            duration: 0.6,
            delay: 0.08,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 30,
          }}
        />
      </Skeleton>
    </a>
  );
}
