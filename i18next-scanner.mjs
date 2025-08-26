import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { Parser } from "i18next-scanner";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const languages = ["en", "ko"];
const parser = new Parser({
  sort: true,
  lngs: languages,
  nsSeparator: false,
  keySeparator: false,
  resource: {
    loadPath: "lib/i18n/languages/{{lng}}/{{ns}}.json",
    savePath: "lib/i18n/languages/{{lng}}/{{ns}}.json",
  },
});

// Parse Translation Function
// i18next.t('key');

const __dirname = dirname(fileURLToPath(import.meta.url));

const components = join(__dirname, "components");
const apps = join(__dirname, "app");
const destination = join(__dirname, "lib/i18n/languages");
if (!existsSync(destination)) mkdirSync(destination, { recursive: true });

const entries = [components, apps];

entries.forEach((entry) => {
  readdirSync(entry, { recursive: true })
    .filter((pathname) => /\.(t|m?j)sx?$/.test(pathname))
    .filter((pathname) => statSync(join(entry, pathname)).isFile())
    .forEach((pathname) => {
      const content = readFileSync(join(entry, pathname), "utf-8");
      parser
        .parseFuncFromString(content, (key) => parser.set(key, key)) // pass a custom handler
        .parseFuncFromString(content, { list: ["t"] }) // override `func.list`
        .parseFuncFromString(content, { list: ["t"] }, (key) => parser.set(key, key))
        .parseFuncFromString(content); // using default options and handler
    });
});

const parsed = parser.get();
for (const lng of languages) {
  const languageDirname = join(destination, lng);
  if (!existsSync(languageDirname)) mkdirSync(languageDirname, { recursive: true });

  for (const [ns, translation] of Object.entries(parsed[lng]))
    writeFileSync(join(languageDirname, `${ns}.json`), JSON.stringify(translation, null, 2));
}
