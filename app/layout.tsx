import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({  
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Damage Inspector Pro",
  description: "Localized auto and property damage repair cost estimations using AI. Made in and for India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}

        {/* Global Footer added here */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap justify-center space-x-6 mb-4">
              <a href="/about-us" className="text-sm text-gray-500 hover:text-gray-900">About Us</a>
              <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
            <p className="text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} AI Damage Inspector Pro. All rights reserved.
            </p>
          </div>
        </footer>

        
        {/* Adsterra Ads */}
        <script src="//pl31276672.profitableratecpmnetwork.com/ef/ad/b7/efadb7e2184f7cc188b19268c6e4846c.js"></script>
        <script src="//pl31276673.profitableratecpmnetwork.com/f8/9a/5a/f89a5aca2d1fce881a896a8656d64625.js"></script>

      </body>
    </html>
  );
}
