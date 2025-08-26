export const languageEnum = {
  ko: "ko",
  en: "en",
} as const;

export type Language = (typeof languageEnum)[keyof typeof languageEnum];

const [langLocale] = (process.env.LANG || process.env.ADM_LOCALE || "ko_KR.UTF-8").split(".");
const [defaultLocale] = (langLocale || "ko_KR").split("_");

export const fallbackLng = defaultLocale as Language;

export const languages = Object.values(languageEnum);

export const defaultNS = "translation";

export const cookieName = "i18next";

export function getOptions(lng: Language = fallbackLng, ns: string = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    nsSeparator: false as const,
    keySeparator: false as const,
    react: { useSuspense: false },
    // React는 XSS를 방지하므로 별도의 이스케이프가 필요하지 않음
    interpolation: { escapeValue: false },
  };
}
