import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ClientLayout from './client-layout';


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  // Initialize on server side
    /* if (typeof window === 'undefined') {
      console.log('Initializing cron jobs...');
      initCronJobs();
    } */

  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <ClientLayout>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
}