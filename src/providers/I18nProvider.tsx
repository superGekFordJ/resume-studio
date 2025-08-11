'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ReactNode, Suspense } from 'react';

// i18next-http-backend is not compatible with SSR
// so we need to wrap the provider in a Suspense boundary
// to avoid a hydration mismatch error.
// See: https://react.i18next.com/misc/ssr

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  return (
    <Suspense>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Suspense>
  );
}
