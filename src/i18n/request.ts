import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
 
function deepMerge(base: any, override: any): any {
  if (base == null) return override;
  if (override == null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  if (typeof base !== 'object' || typeof override !== 'object') return override;

  const out: Record<string, any> = {...base};
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in base ? deepMerge((base as any)[k], v) : v;
  }
  return out;
}

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
 
  return {
    locale,
    messages: deepMerge(
      (await import(`../../messages/zh.json`)).default,
      (await import(`../../messages/${locale}.json`)).default
    )
  };
});