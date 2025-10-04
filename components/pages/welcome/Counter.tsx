import { SlidingNumber } from "@/components/ui/shadcn-io/sliding-number";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { redis } from "@/lib/redis";
import { cn } from "@/lib/utils";

interface HeroProps extends React.ComponentProps<"div"> {
  lng: Language;
}

export default async function Counter({ lng: lngParam, className, ...props }: HeroProps) {
  const { t } = await useTranslation(lngParam);

  if (!redis.isOpen) await redis.connect();

  const [[, postEntry], [, docEntry]] = (await redis
    .multi()
    .ts.get("ts:p:__total__:value")
    .ts.get("ts:d:__total__:value")
    .exec())!.entries();

  const [, postViewValue] = Object.values(postEntry);
  const [, docViewValue] = Object.values(docEntry);

  return (
    <div className={cn("flex flex-col px-8 py-6 text-center", className)} {...props}>
      <div className="flex flex-col items-center space-y-2">
        <SlidingNumber
          number={Number(postViewValue) + Number(docViewValue)}
          decimalSeparator=","
          className="text-4xl"
          inView
        />
        <p className="text-sm">{t("total document views")}</p>
      </div>
    </div>
  );
}
