"use client";

import { TFunction } from "i18next";

interface StatusMessageProps {
  t: TFunction;
  status: number;
  options: RequestInit;
}

export function statusMessage({ t, status, options }: StatusMessageProps) {
  if (status === 200) {
    if ("PUT" === options.method || "PATCH" === options.method)
      return t("Update has been successful.");

    return t("Request has been successful.");
  }
  if (status === 201) return t("Create has been successful.");
  if (status === 204) {
    if ("DELETE" === options.method) return t("Delete has been successful.");

    return t("Request has been successful.");
  }
  if (status === 404) return t("Not Found");
  if (status === 409) {
    if ("PUT" === options.method || "PATCH" === options.method)
      return t("Update failed due to a conflict.");
  }
}
