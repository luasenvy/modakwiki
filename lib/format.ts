import { Language, languageEnum } from "@/lib/i18n/config";
import { DAY, HOUR, MINUTE } from "@/lib/time";

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
