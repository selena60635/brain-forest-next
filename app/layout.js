import { AuthContext } from "../components/AuthContext";
import Header from "../components/Header";
import "./globals.css";

export const metadata = {
  title: "Brain Forest",
  description:
    "An online mind mapping tool that visualizes your brainstorming.",
  charset: "utf-8",
  author: "Selena",
};

// 專門用於 viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          <Header />
          <main>{children}</main>
        </AuthContext>
      </body>
    </html>
  );
}
