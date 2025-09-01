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
  cc0: "cc0",
  ccby: "ccby",
  ccbysa: "ccbysa",
  ccbysa3: "ccbysa3",
  ccbyncsa: "ccbyncsa",
  public: "public",
  kogl1: "kogl1",
  kogl2: "kogl2",
  kogl3: "kogl3",
  kogl4: "kogl4",
  koglopen: "koglopen",
};

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

export const licenseNameEnum = {
  [licenseEnum.cc0]: "CC0 1.0 공통",
  [licenseEnum.ccby]: "CC BY 4.0 국제규약",
  [licenseEnum.ccbysa]: "CC BY-SA 4.0 국제규약",
  [licenseEnum.ccbysa3]: "CC BY-SA 3.0 Unported",
  [licenseEnum.ccbyncsa]: "CC BY-NC-SA 4.0 국제규약",
  [licenseEnum.public]: "퍼블릭 도메인",
  [licenseEnum.kogl1]: "공공누리 제 1유형: 출처표시",
  [licenseEnum.kogl2]: "공공누리 제 2유형: 출처 표시 + 상업적 이용금지",
  [licenseEnum.kogl3]: "공공누리 제 3유형: 출처표시 + 변경금지",
  [licenseEnum.kogl4]: "공공누리 제 4유형: 출처표시 + 상업적 이용금지 + 변경금지",
  [licenseEnum.koglopen]: "공공누리 만료 공공저작물: 자유이용",
} as const;

export type LicenseName = (typeof licenseNameEnum)[keyof typeof licenseNameEnum];

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
