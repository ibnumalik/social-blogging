import '../styles/globals.css';
import '../configureAmplify';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Auth, Hub } from 'aws-amplify';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const [signedInUser, setSignedInUser] = useState(false);

  useEffect(() => {
    authListener();
  });

  async function authListener() {
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          return setSignedInUser(true);
        case 'signOut':
          return setSignedInUser(false);
      }
    });

    try {
      await Auth.currentAuthenticatedUser();
      setSignedInUser(true);
    } catch (error) {}
  }

  return (
    <div>
      <Head>
        <title>Social blog</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <nav className="p-6 border-b border-gray-300">
        <Link href="/">
          <span className="mr-6 cursor-pointer">Home</span>
        </Link>
        <Link href="/create-post">
          <span className="mr-6 cursor-pointer">Create Post</span>
        </Link>
        {signedInUser && (
          <Link href="/my-posts">
            <span className="mr-6 cursor-pointer">My Posts</span>
          </Link>
        )}
        <Link href="/profile">
          <span className="mr-6 cursor-pointer">Profile</span>
        </Link>
      </nav>
      <div className="py-8 px-16">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
