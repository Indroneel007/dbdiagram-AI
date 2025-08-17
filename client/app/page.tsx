import { SignedIn, SignedOut } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import Main from './main';
import Landing from './landing';
import { useAuth } from "@clerk/clerk-react";

export default function Home() {
  const { getToken, isLoaded } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
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
