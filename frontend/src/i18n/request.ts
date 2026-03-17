import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Fallback to 'en' if locale is undefined to prevent crash during build/initialization
  const activeLocale = locale || 'en';
  
  return {
    locale: activeLocale,
    messages: (await import(`../../messages/${activeLocale}.json`)).default
  };
});
