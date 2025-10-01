import { Language, languageEnum } from "@/lib/i18n/config";

type DateFormatType =
  | "default"
  | "iso"
  | "ymd"
  | "hms"
  | "md h"
  | "md hm"
  | "ymd h"
  | "ymd hm"
  | "ymd hms"
  | "full"
  | "log"
  | "LLL";

/**
 * 날짜를 다양한 형식으로 반환한다.
 *
 * @description
 * 날짜 객체를 지정된 형식으로 변환한다.
 *
 * @example
 * formatter(new Date(), { type: "ymd hm" })
 *
 * @param date `Date` | `number`
 * @param options.type `default` | `iso` | `ymd` | `hms` | `md h` | `md hm` | `ymd h` | `ymd hm` | `ymd hms` | `full` | `log` | `LLL`
 * @returns string
 */
export const date = (timestamp: Date | number, options?: { type?: DateFormatType }) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  const { type = "default" } = options ?? { type: "default" };

  if ("iso" === type) return date.toISOString();

  if ("ymd" === type) return date.toISOString().substring(0, 10);

  const intlOptions: Intl.DateTimeFormatOptions = { hourCycle: "h23" };

  // toLocaleString() 함수는 시스템에 맞추어 자동으로
  // 타임존 오프셋을 조정하므로 undefined를 전달함
  if ("LLL" === type) return date.toLocaleString(undefined, intlOptions);

  const localeStr = date.toLocaleString(undefined, {
    ...intlOptions,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if ("hms" === type) return localeStr.replace(/\d+\. \d+\. \d+\./, "").trim();

  const full = localeStr.replace(/(\d+)\. (\d+)\. (\d+)\./, "$1-$2-$3");

  if ("md h" === type) return full.replace(/^\d+-|(:\d+){2}$/g, "");
  if ("ymd h" === type) return full.replace(/(:\d+){2}$/g, "");
  if ("md hm" === type) return full.replace(/^\d+-|:\d+$/g, "");
  if ("ymd hm" === type) return full.replace(/:\d+$/g, "");

  // if (["full", "ymd hms", "log"].includes(type))
  return full;
};

export const MINUTE = 60_000;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = 7 * DAY;

const i18n = {
  ko: {
    minute: "분 전",
    hour: "시간 전",
    day: "일 전",
  },
  en: {
    minute: "minutes ago",
    hour: "hours ago",
    day: "days ago",
  },
};

export function fromNow(epoch: number | Date, lng: Language = languageEnum.ko) {
  if (epoch instanceof Date) epoch = epoch.getTime();
  const diff = Date.now() - epoch;

  if (diff < HOUR) return `${Math.ceil(diff / MINUTE)} ${i18n[lng].minute}`;

  if (diff < DAY) return `${Math.ceil(diff / HOUR)} ${i18n[lng].hour}`;

  return `${Math.ceil(diff / DAY)} ${i18n[lng].day}`;
}

const sizes = {
  B: "B",
  KB: "KB",
  MB: "MB",
} as const;

export const byteto = (
  value: number,
  options?: {
    type?: keyof typeof sizes;
    autoscale?: boolean;
    precision?: number;
    locale?: Intl.LocalesArgument;
  },
): string => {
  const type = options?.type ?? sizes.B;
  let cursor = value;
  switch (type) {
    case sizes.MB:
      cursor /= 1024;
    case sizes.KB:
      cursor /= 1024;
  }

  if (options?.autoscale !== false && cursor >= 1024) {
    switch (type) {
      case sizes.B:
        return byteto(value, { ...options, type: sizes.KB });
      case sizes.KB:
        return byteto(value, { ...options, type: sizes.MB });
    }
  }

  return new Intl.NumberFormat(options?.locale)
    .format(Number(cursor.toFixed(options?.precision ?? 2)))
    .concat(type);
};
