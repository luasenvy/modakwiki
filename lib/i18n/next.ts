import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import type { Language } from "@/lib/i18n/config";
import { defaultNS, fallbackLng, getOptions } from "@/lib/i18n/config";

export async function useTranslation(lng: Language = fallbackLng, ns: string = defaultNS) {
  const instance = createInstance();
  await instance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (lng: Language, ns: string) => import(`@/lib/i18n/languages/${lng}/${ns}.json`),
      ),
    )
    .init(getOptions(lng, ns));

  return instance;
}
