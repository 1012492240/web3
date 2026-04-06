import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // 中、英、日、韩、阿拉伯
  locales: ['zh', 'en', 'ja', 'ko', 'ar'],
  defaultLocale: 'en',
  // Disable locale detection to always use default locale
  localeDetection: false,
});