import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// SF Pro Display (Primary Body & Headings)
const sfProDisplay = localFont({
  src: [
    { path: '../../public/fonts/sf_pro_display/sf_display_regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/sf_pro_display/sf_pro_display_medium.otf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/sf_pro_display/sf_pro_display_bold.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/sf_pro_display/sf_display_light_italic.otf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/sf_pro_display/sf_display_semi_bold_italic.otf', weight: '600', style: 'italic' },
  ],
  variable: '--font-sf-pro',
  display: 'swap',
});

// Feature Display (Branding & Display Titles)
const featureDisplay = localFont({
  src: [
    { path: '../../public/fonts/feature_display/feature_display_regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/feature_display/feature_display_bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-feature-display',
  display: 'swap',
});

// Depnoid (Decorative Accent Font)
const depnoidFont = localFont({
  src: [
    { path: '../../public/fonts/depnoid/depnoid.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-depnoid',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Paydora Admin — Operations & Compliance Console',
  description: 'Operations, KYC identity verification, settlement, and customer support for Paydora.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sfProDisplay.variable} ${featureDisplay.variable} ${depnoidFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
