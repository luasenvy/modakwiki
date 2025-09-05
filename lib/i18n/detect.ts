import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { fallbackLng, Language, languages } from "@/lib/i18n/config";

export function negotiate(language?: string | null): Language {
  const acceptLanguages = new Negotiator({
    headers: { "accept-language": language || "" },
  }).languages();
  try {
    return match(acceptLanguages, languages, fallbackLng) as Language;
  } catch (err) {
    /**
     * SSR 내에서 `fetch`를 사용할 경우,
     * 브라우저에서 사용중인 언어정보와 동기화하여 함수를 호출할 수 있는 방법을 제공해야함.
     * `accept-language`가 브라우저와 다르거나, 아니면 정보가 비어있어서 오류가 발생할 수 있음.
     */
    if (err instanceof RangeError) return match([fallbackLng], languages, fallbackLng) as Language;
    throw err;
  }
}
