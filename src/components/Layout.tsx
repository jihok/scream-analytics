import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface Props {
  children: any;
  home?: 'markets' | 'protocol';
  className?: string;
}

export default function Layout({ children, home, className }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="flex justify-between p-5">
        <Link href="/">
          <a>
            {home ? (
              <div>{/** TODO */}</div>
            ) : (
              <Image src="/img/Back.png" alt="home" width={20} height={15} />
            )}
          </a>
        </Link>

        <div className="flex items-center">
          {home && (
            <div className="hidden lg:flex">
              <Link href="/">
                <a
                  className={`${
                    home === 'markets' ? 'font-sans-bold border-b border-border-primary' : ''
                  } text-title mr-10 pb-2`}
                >
                  Market Analytics
                </a>
              </Link>
              <Link href="/">
                <a
                  className={`${
                    home === 'protocol' ? 'font-sans-bold border-b border-border-primary' : ''
                  } text-title mr-16 pb-2`}
                >
                  Protocol Overview
                </a>
              </Link>
            </div>
          )}

          {/* desktop: search bar, tablet/mobile: hamburger */}
          <div className="hidden lg:flex w-80 border border-border-primary rounded-full text-body py-3 px-6">
            <input
              type="text"
              className="w-full focus:outline-none"
              placeholder="Search for an account..."
              value={searchTerm}
              onChange={(val) => {
                console.log(val.target.value);
                setSearchTerm(val.target.value);
              }}
            />
            <button type="submit" disabled={!searchTerm}>
              <Image
                src="/img/Search.png"
                alt="menu"
                width={23}
                height={23}
                onClick={async () => {
                  if (searchTerm) await router.push(`/account/${searchTerm}`);
                }}
              />
            </button>
          </div>
          <div className="block lg:hidden" style={{ cursor: 'pointer' }}>
            <Image
              src="/img/Menu.png"
              alt="menu"
              width={24}
              height={16}
              onClick={() => console.log('TODO')}
            />
          </div>
        </div>
      </header>
      <main className={`flex flex-col md:px-40 ${className}`}>{children}</main>
      <footer className="flex pt-40 pb-20 justify-center">scream</footer>
    </>
  );
}
