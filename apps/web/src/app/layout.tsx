import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Required App Router root layout. Locale shell owns `<html>` / `<body>`.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
