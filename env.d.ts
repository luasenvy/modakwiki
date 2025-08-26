declare module "*.glb" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

// declare namespace NodeJS {
//   interface ProcessEnv {
//     // DB Configurations
//     DB_URL: string;
//     RDS_URL: string;
//     OAI_KEY: string;
//     DTG_KEY: string;

//     // Site Configurations
//     SITE_TITLE: string;
//     SITE_DESCRIPTION: string;
//     SITE_BASEURL: string;

//     // Logo Configurations
//     // Base64 Image Format or URL
//     LOGO_LIGHT: string;
//     // Base64 Image Format or URL
//     LOGO_DARK: string;
//     FEED_SIZE: string;

//     // Storage Configurations
//     STORAGE_ROOT: string;
//     KEYBOARD_CAT: string;
//   }
// }
