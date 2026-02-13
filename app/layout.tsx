import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next";
import { VT323 } from "next/font/google"; // 1. Import the Minecraft font
import "./globals.css";

// 2. Configure the font
const minecraft = VT323({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-minecraft" 
});

export const metadata: Metadata = {
  title: {
    template: '%s | MC Plans',
    default: 'MC Plans',
  },
  description: 'The ultimate dashboard for planning Minecraft builds and coordinating with friends.',
  icons: {
    icon: '/icon.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* 3. Apply the font variable and your custom Tailwind background */}
        <body className={`${minecraft.variable} font-minecraft antialiased bg-mc-stone text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}