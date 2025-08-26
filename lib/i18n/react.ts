"use client";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import resourcesToBackend from "i18next-resources-to-backend";

import { useEffect, useState } from "react";
import type { UseTranslationOptions } from "react-i18next";
import { initReactI18next, useTranslation as useTranslationI18next } from "react-i18next";

import type { Language } from "@/lib/i18n/config";
import { cookieName, defaultNS, fallbackLng, getOptions, languages } from "@/lib/i18n/config";

const runsOnServerSide = typeof window === "undefined";

i18next
  .use(ChainedBackend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: { order: ["path", "htmlTag", "cookie", "navigator"] },
    preload: runsOnServerSide ? languages : [],
    backend: {
      backends: [
        HttpBackend, // if a namespace can't be loaded via normal http-backend loadPath, then the inMemoryLocalBackend will try to return the correct resources
        resourcesToBackend(
          (lng: Language, ns: string) => import(`@/lib/i18n/languages/${lng}/${ns}.json`),
        ),
      ],
      backendOptions: [
        {
          loadPath: "/languages/{{lng}}/{{ns}}",
          savePath: "/languages/{{lng}}/{{ns}}",
        },
      ],
    },
  });

export function useTranslation(
  lng: Language = fallbackLng,
  ns: string = defaultNS,
  options?: UseTranslationOptions<typeof cookieName>,
) {
  const reactI18next = useTranslationI18next(ns, { useSuspense: true, ...options });
  const { i18n } = reactI18next;

  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng);
  } else {
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return;
      setActiveLng(i18n.resolvedLanguage);
    }, [activeLng, i18n.resolvedLanguage]);

    useEffect(() => {
      i18n.changeLanguage(lng);
    }, [lng, i18n]);
  }

  return reactI18next;
}
