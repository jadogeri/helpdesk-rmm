// apps/frontend/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 💡 FIXED: In Next.js, static files inside the public folder are routed from the web root directory.
// Drop the hidden '../public/' asset prefix path so the compiler links the woff files safely during build passes.
const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff", // 👈 Ensure file paths match your explicit disk location perfectly
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff", // 👈 Ensure file paths match your explicit disk location perfectly
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Create a ticket | RMM Service Desk",
  description: "Submit a support request to the RMM service desk.",
  keywords: ["RMM", "Service Desk", "Support", "Ticket"],
  authors: [{ name: "Joseph Adogeri" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 
          🔄 FIXED: To satisfy React 19 layout injection validations completely,
          provide an explicit, stable key identifier to your dangerous script tag boundary.
        */}
        <script
          key="theme-initializer" // 👈 Add explicit key tracker tag
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('rmm-service-desk-theme');
                  var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = saved === 'dark' || saved === 'light' ? saved : preferred;
                  document.documentElement.dataset.theme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
