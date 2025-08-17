'use client';

import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import React from 'react';
import Main from './main';
import Landing from './landing';

export default function Home() {
  const { getToken, isLoaded } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchToken() {
      if (isLoaded) {
        const t = await getToken();
        setToken(t);
        console.log("Clerk JWT:", t); // copy this for Postman
      }
    }
    fetchToken();
  }, [isLoaded, getToken]);
  
  return (
    <>
      <SignedIn>
        <Main />
      </SignedIn>
      
      <SignedOut>
        <Landing />
      </SignedOut>
    </>
  );
}
