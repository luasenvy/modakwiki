import { parse as urlParse } from "@/lib/url";

export const logo = {
  light: process.env.LOGO_LIGHT!,
  dark: process.env.LOGO_DARK!,
};

export type LogoType = typeof logo;

export const site = {
  name: process.env.SITE_TITLE!,
  description: process.env.SITE_DESCRIPTION!,
  baseurl: process.env.SITE_BASEURL!,
  author: "luasenvy",
};

export type SiteType = typeof site;

export const betterAuth = {
  baseurl: process.env.BETTER_AUTH_URL!,
  providers: {
    github: {
      clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID!,
      clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET!,
    },
    cloudflare: {
      turnstile: {
        siteKey: process.env.BETTER_AUTH_TURNSTILE_SITE_KEY!,
        secretKey: process.env.BETTER_AUTH_TURNSTILE_SECRET_KEY!,
      },
    },
  },
};

export type BetterAuth = typeof betterAuth;

export const storage = {
  root: process.env.STORAGE_ROOT!,
};

export type Storage = typeof storage;

export const openai = {
  apiKey: process.env.OAI_KEY!,
};

export type Openai = typeof openai;

export const datago = {
  apiKey: process.env.DTG_KEY!,
};

export type Datago = typeof datago;

const redisUrl = urlParse(process.env.RDS_URL!);

export const redis = {
  url: redisUrl?.baseurl,
  password: redisUrl?.password,
  database: Number(redisUrl?.pathname.substring(1) || 0),
};

export type Redis = typeof redis;

const psqlUrl = urlParse(process.env.DB_URL!);

export const postgresql = {
  host: psqlUrl?.hostname,
  port: Number(psqlUrl?.port),
  user: decodeURIComponent(psqlUrl?.username as string),
  password: decodeURIComponent(psqlUrl?.password as string),
  database: psqlUrl?.pathname.substring(1),
};

export type Postgresql = typeof postgresql;

export const isDev = process.env.NODE_ENV! !== "production";

export const keyboardcat = process.env.KEYBOARD_CAT! || "";
