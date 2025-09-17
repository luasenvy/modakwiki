"use client";

import { TFunction } from "i18next";

interface StatusMessageProps {
  t: TFunction;
  res: Response;
  options?: RequestInit;
}

export async function statusMessage({ t, res, options }: StatusMessageProps) {
  const method = options?.method ?? "GET";

  const status = res.status;
  if (status === 200) {
    if ("PUT" === method || "PATCH" === method) return t("Update has been successful.");

    return t("Request has been successful.");
  }
  if (status === 201) return t("Create has been successful.");
  if (status === 204) {
    if ("DELETE" === method) return t("Delete has been successful.");

    return t("Request has been successful.");
  }
  if (status === 404) return t("Not Found");
  if (status === 409) {
    if ("PUT" === method || "PATCH" === method) return t("Update failed due to a conflict.");
  }
  if (status === 415) {
    return `${t("Inappropriate content has been detected.")}: ${(await res.json()).map((m: string) => t(m)).join(",")}`;
  }
  if (status === 501) return t("Not Implemented");
}
