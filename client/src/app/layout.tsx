import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Orbit Workspace — All your projects, tasks, and team in one intelligent orbit.",
  description: "Orbit Workspace brings all your projects, tasks, teammates, and tools together in one intelligent command center. Built for ambitious teams.",
  keywords: "project management, task management, team collaboration, workspace, productivity",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Orbit Workspace",
    description: "All your projects, tasks, and team in one intelligent orbit.",
    type: "website",
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
      data-theme="dark"
      className="font-sans"
      style={{ height: "100%" }}
    >
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "Inter, 'Segoe UI', sans-serif" }}>
        <ReduxProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
