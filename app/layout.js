import "./globals.css";
import Provider from "@components/Provider";
import Nav from "@components/Nav";

export const metadata = {
  title: "Healthopedia AI",
  description: "AI-powered medical Q&A and community prompt sharing platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Nav />
          <main className="app">
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
