import { SignedIn, SignedOut } from '@clerk/nextjs';
import React from 'react';
import Main from './main';
import Landing from './landing';
export default function Home() {
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
