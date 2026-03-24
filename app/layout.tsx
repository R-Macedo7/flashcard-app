import "./globals.css";
// The "./" means: Look in the same folder I am in (the app folder)
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import { Navbar } from "./components/Navbar"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 bg-gray-50">
        <ServiceWorkerRegister />
        
        <Navbar />

        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}