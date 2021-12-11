import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface Props {
  children: any;
  home?: boolean;
  className?: string;
}

export default function Layout({ children, home, className }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  return (
    <div className="bg-gray opacity-95 text-primary w-fit md:w-full">
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex">
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
        <form onSubmit={async () => await router.push(`/account/${searchTerm}`)}>
          <input
            type="text"
            placeholder="Search for an account..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val.target.value)}
          />
        </form>
      </header>
      <main className={`flex flex-col md:px-40 ${className}`}>{children}</main>
      <footer className="flex pt-40 pb-20 justify-center">scream</footer>
    </div>
  );
}
