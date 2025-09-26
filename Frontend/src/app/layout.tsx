// src/app/layout.tsx
"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloClient, InMemoryCache, ApolloLink, Observable } from "@apollo/client";
import "./globals.css";
import { ApolloProvider } from "@apollo/client/react";
import api from "@/lib/axios";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const axiosLink = new ApolloLink((operation) => {
    return new Observable((observer) => {
      api.post("/graphql", {
        query: operation.query.loc?.source.body,
        variables: operation.variables,
      })
        .then((result) => {
          observer.next(result.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  });
  const client = new ApolloClient({ link: axiosLink, cache: new InMemoryCache() });

  return (
    
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center">
            <ApolloProvider client={client}>{children}</ApolloProvider>
          </main>
          <div className="flex justify-center text-gray-400 text-sm py-2">
            &copy; 2025 RideSignals. All rights reserved.
          </div>
        </body>
      </html>
    
  );
}
