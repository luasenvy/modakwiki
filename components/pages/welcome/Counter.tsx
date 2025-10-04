import { SlidingNumber, SlidingNumberProps } from "@/components/ui/shadcn-io/sliding-number";
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

  const [[, postEntry], [, docEntry], [, counts]] = (await redis
    .multi()
    .ts.get("ts:p:__total__:value")
    .ts.get("ts:d:__total__:value")
    .mGet(["count:p", "count:d"])
    .exec())!.entries();

  const [, postViewValue] = Object.values(postEntry);
  const [, docViewValue] = Object.values(docEntry);
  const [docCount, postCount] = Object.values(counts);

  const numberFormat = new Intl.NumberFormat(lngParam);

  return (
    <div className={cn("flex w-full items-center justify-around px-8 py-6", className)} {...props}>
      <div className="flex flex-col items-center space-y-2">
        <SlidingNumberK
          formatter={numberFormat}
          number={Number(postViewValue) + Number(docViewValue)}
          className="text-4xl"
        />
        <p className="text-sm">{t("Total View")}</p>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <SlidingNumberK formatter={numberFormat} number={Number(postCount)} className="text-4xl" />
        <p className="text-sm">{t("Documents")}</p>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <SlidingNumberK formatter={numberFormat} number={Number(docCount)} className="text-4xl" />
        <p className="text-sm">{t("Posts")}</p>
      </div>
    </div>
  );
}

interface SlidingNumberKProps extends SlidingNumberProps {
  number: number;
  formatter: Intl.NumberFormat;
}

function SlidingNumberK({ number, formatter, className, ...props }: SlidingNumberKProps) {
  const isK = number > 10000;

  return (
    <SlidingNumber
      number={isK ? number / 1000 : number}
      title={formatter.format(number)}
      className={cn(className, { "after:content-['K']": isK })}
      decimalPlaces={isK ? 1 : 0}
      decimalSeparator="."
      inView
      {...props}
    />
  );
}
