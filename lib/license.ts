import Ccby from "@/public/license/cc/by.webp";
import Ccbyncsa from "@/public/license/cc/byncsa.webp";
import Ccbysa from "@/public/license/cc/bysa.webp";
import Cczero from "@/public/license/cc/zero.webp";
import KoglOpenImage from "@/public/license/kogl/open.webp";
import Kogl1Image from "@/public/license/kogl/type1.webp";
import Kogl2Image from "@/public/license/kogl/type2.webp";
import Kogl3Image from "@/public/license/kogl/type3.webp";
import Kogl4Image from "@/public/license/kogl/type4.webp";
import Public from "@/public/license/public.webp";

export const licenseEnum = {
  public: "public",
  cc0: "cc0",
  ccby: "ccby",
  ccbysa: "ccbysa",
  ccbysa3: "ccbysa3",
  ccbyncsa: "ccbyncsa",
  kogl1: "kogl1",
  kogl2: "kogl2",
  kogl3: "kogl3",
  kogl4: "kogl4",
  koglopen: "koglopen",
} as const;

export type License = (typeof licenseEnum)[keyof typeof licenseEnum];

export const licenseImageEnum = {
  [licenseEnum.cc0]: Cczero,
  [licenseEnum.ccby]: Ccby,
  [licenseEnum.ccbysa]: Ccbysa,
  [licenseEnum.ccbysa3]: Ccbysa,
  [licenseEnum.ccbyncsa]: Ccbyncsa,
  [licenseEnum.public]: Public,
  [licenseEnum.kogl1]: Kogl1Image,
  [licenseEnum.kogl2]: Kogl2Image,
  [licenseEnum.kogl3]: Kogl3Image,
  [licenseEnum.kogl4]: Kogl4Image,
  [licenseEnum.koglopen]: KoglOpenImage,
} as const;

export type LicenseImage = (typeof licenseImageEnum)[keyof typeof licenseImageEnum];

export const licenseLinkEnum = {
  [licenseEnum.cc0]: "https://creativecommons.org/publicdomain/zero/1.0/",
  [licenseEnum.ccby]: "https://creativecommons.org/licenses/by/4.0/",
  [licenseEnum.ccbysa]: "https://creativecommons.org/licenses/by-sa/4.0/",
  [licenseEnum.ccbysa3]: "https://creativecommons.org/licenses/by-sa/3.0/",
  [licenseEnum.ccbyncsa]: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  [licenseEnum.public]: "https://en.wikipedia.org/wiki/public_domain",
  [licenseEnum.kogl1]: "https://www.kogl.or.kr/info/licenseType1.do",
  [licenseEnum.kogl2]: "https://www.kogl.or.kr/info/licenseType2.do",
  [licenseEnum.kogl3]: "https://www.kogl.or.kr/info/licenseType3.do",
  [licenseEnum.kogl4]: "https://www.kogl.or.kr/info/licenseType4.do",
  [licenseEnum.koglopen]: "https://www.kogl.or.kr/info/freeUse.do",
} as const;

export type LicenseLink = (typeof licenseLinkEnum)[keyof typeof licenseLinkEnum];
