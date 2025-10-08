"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import { ApolloProvider } from "@apollo/client/react";
import "./globals.css";
import { APIProvider } from "@vis.gl/react-google-maps";
import { gqlClient } from "@/lib/graphql/client";
import { Suspense } from "react";
import { Loader } from "lucide-react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ToastContainer
          draggable
          draggablePercent={50}
          ></ToastContainer>
          <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center">
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
              solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
              libraries={["places"]}
            >
              <ApolloProvider client={gqlClient}>
                <Suspense fallback={<Loader className="animate-spin"/>}>
                  {children}
                </Suspense>
              </ApolloProvider>
            </APIProvider>
          </main>
        </body>
      </html>
    
  );
}
