"use client"

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { dark } from '@clerk/themes';
import Link from "next/link";
import Image from "next/image";


const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

const CustomHeader = () => (
  <Link
    href="/"
    className="flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center"
  >
    <Image
      src="/icons/logo.svg"
      alt="logo"
      width={23}
      height={27}
      style={{ marginRight: 7 }}
    />
    <h1 className="text-24 font-extrabold text-white max-lg:hidden">
      Mann ki Baat
    </h1>
  </Link>
);

const ConvexClerkProvider = ({ children }: { children: ReactNode }) => (
  <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string} appearance={{
    baseTheme: dark,
    layout: { 
      socialButtonsVariant: 'iconButton',
      logoImageUrl: '/icons/logo.png'
    },
    variables: {
      colorBackground: '#15171c',
      colorPrimary: '#4B4D53',
      colorText: '#D3D3D3',
      colorInputBackground: '#1b1f29',
      colorInputText: 'white',

    },
  }}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  </ClerkProvider>
);

export default ConvexClerkProvider;