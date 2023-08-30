/*
 * @Author: aelf-lxy
 * @Date: 2023-07-31 14:37:10
 * @LastEditors: Peterbjx
 * @LastEditTime: 2023-08-16 15:57:46
 * @Description: root layout
 */

import '@_style/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import RootProvider from './pageProvider';
import Header from '@_components/Header';
import Footer from '@_components/Footer';
import MainContainer from '@_components/Main';
import { headers } from 'next/headers';
import StyledComponentsRegistry from '@_lib/AntdRegistry';
import { isMobileOnServer } from '@_utils/isMobile';
import clsx from 'clsx';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};
async function fetchData() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const res = {
    price: { USD: 1 },
    previousPrice: { usd: 2 },
  };
  // const res = await request.common.getPrice({ cache: 'no-store' } as Request);
  return res;
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await fetchData();
  const { price, previousPrice } = data;
  const headersList = headers();
  const isMobile = isMobileOnServer(headersList);

  return (
    <html lang="en" className="h-full w-full">
      <body>
        <div className="flex flex-col h-full">
          <StyledComponentsRegistry>
            <Suspense>
              <Header priceSSR={price} previousPriceSSR={previousPrice} isMobileSSR={isMobile} />
            </Suspense>
            <div className="flex-1 overflow-y-scroll" id="scroll-content">
              <RootProvider isMobileSSR={isMobile}>
                <Suspense>
                  <MainContainer>{children}</MainContainer>
                </Suspense>
              </RootProvider>
              <Suspense>
                <Footer isMobileSSR={isMobile} />
              </Suspense>
            </div>
          </StyledComponentsRegistry>
        </div>
      </body>
    </html>
  );
}
