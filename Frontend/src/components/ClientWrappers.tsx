"use client";
import { gqlClient } from "@/lib/graphql/client";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ApolloProvider } from "@apollo/client/react";
import InstallPrompt from "./InstallPrompt";
import PushNotificationManager from "./PushNotificationManager";

export default function ClientWrappers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
      libraries={["places"]}
    >
      <ApolloProvider client={gqlClient}>
        <PushNotificationManager/>
        <InstallPrompt />
        {children}
      </ApolloProvider>
    </APIProvider>
  );
}
