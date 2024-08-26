import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
  charset: "utf-8",
  author: "Selena",
};

// 專門用於 viewport 的匯出
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const user = false;
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-light border-b border-secondary text-secondary">
          <nav className="flex justify-between items-center container mx-auto px-4">
            <div className="flex space-x-3 items-center my-4">
              <Link href="/" className="text-2xl font-bold " to="/">
                <h1>Brain Forest</h1>
              </Link>
            </div>
            <ul className="flex items-center space-x-8">
              <li>
                <Link
                  href="/folder"
                  className="px-3 py-2 font-medium hover:text-primary"
                >
                  Folder
                </Link>
              </li>
              <li>
                <Link
                  href="/workArea"
                  className="px-3 py-2 font-medium  hover:text-primary"
                >
                  Workarea
                </Link>
              </li>
              <li>
                {user ? (
                  <button
                    // onClick={handleSignOut}
                    className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
                  >
                    Sign In
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
