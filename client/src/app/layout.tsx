import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Digest Auth Example",
  description: "A Example of how to use Digest Authentication with Next.js",
};

// biome-ignore lint/style/noDefaultExport: Default export is necessary for Next.js
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="m-10 antialiased">
        {children}
      </body>
    </html>
  );
}
