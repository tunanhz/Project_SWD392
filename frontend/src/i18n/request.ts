import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale
  const activeLocale = locale || 'en';
  
  console.log(`Loading i18n messages for locale: ${activeLocale}`);
  
  try {
    const messages = (await import(`../messages/${activeLocale}.json`)).default;
    return {
      locale: activeLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${activeLocale}`, error);
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    };
  }
});
