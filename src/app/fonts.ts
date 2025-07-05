import localFont from 'next/font/local';

// Load 8anity font
export const eightAnity = localFont({
  src: [
    {
      path: '../../public/fonts/8anity.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-8anity',
  display: 'swap',
});

// Add other fonts here as needed
