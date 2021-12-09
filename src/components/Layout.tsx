import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

interface Props {
  children: any;
  home?: boolean;
}

export default function Layout({ children, home }: Props) {
  return (
    <div className="bg-gray opacity-95 text-primary">
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <div>
          <Link href="/">
            <a>Home</a>
          </Link>
        </div>
        {home && (
          <>
            <div>Market Analytics</div>
            <div>Protocol Overview</div>
          </>
        )}
        <form>
          <input type="text" placeholder="Search for an account..."></input>
        </form>
      </header>
      <main className="flex flex-col sm:px-40">{children}</main>
    </div>
  );
}
