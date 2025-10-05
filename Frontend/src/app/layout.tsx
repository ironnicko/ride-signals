"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloClient, InMemoryCache, ApolloLink, Observable } from "@apollo/client";
import { ToastContainer } from 'react-toastify';
import { ApolloProvider } from "@apollo/client/react";
import api from "@/lib/axios";
import "./globals.css";
import { APIProvider } from "@vis.gl/react-google-maps";

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
          <ToastContainer></ToastContainer>
          <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center">
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
              solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
              libraries={["places"]}
            >
              <ApolloProvider client={client}>
                {children}
              </ApolloProvider>
            </APIProvider>
          </main>
        </body>
      </html>
    
  );
}
