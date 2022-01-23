import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import SearchBar from './SearchBar';

interface Props {
  children: any;
  home?: 'markets' | 'protocol';
  className?: string;
}

const ICON_HEIGHT = 24;

export default function Layout({ children, home, className }: Props) {
  const [showMenu, setShowMenu] = useState(false);
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
              <Image src="/images/Back.png" alt="home" width={20} height={15} />
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
              <Link href="/protocol">
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

          <div className="hidden lg:flex w-80">
            <SearchBar />
          </div>
          <div className="block lg:hidden cursor-pointer">
            {showMenu ? (
              <div style={{ width: 20, height: ICON_HEIGHT, position: 'relative' }}>
                <Image
                  src="/images/Cancel.png"
                  alt="cancel"
                  layout="fill"
                  objectFit="contain"
                  onClick={() => setShowMenu(false)}
                />
              </div>
            ) : (
              <Image
                src="/images/Menu.png"
                alt="menu"
                width={ICON_HEIGHT}
                height={16}
                onClick={() => setShowMenu(true)}
              />
            )}
            {showMenu && (
              <div
                className="flex flex-col px-5 pt-8 shadow-3xl"
                style={{
                  backgroundColor: '#0E0F10',
                  position: 'fixed',
                  top: 80,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  zIndex: 50,
                }}
              >
                <SearchBar />
                <Link href="/">
                  <a className="px-5 pt-10 pb-5">
                    <h1
                      className="font-sans"
                      onClick={() => {
                        if (home === 'markets') setShowMenu(false);
                      }}
                    >
                      Market Analytics
                    </h1>
                  </a>
                </Link>
                <Link href="/protocol">
                  <a className="px-5">
                    <h1
                      className="font-sans"
                      onClick={() => {
                        if (home === 'protocol') setShowMenu(false);
                      }}
                    >
                      Protocol Overview
                    </h1>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/*
        {showMenu && 'fixed'} is to disable scrolling for the mobile menu.
        It's not ideal due to the following edge case: a desktop window could be small, open the menu,
        then resized to large, which would disable scrolling but hide the menu.
      */}
      <main className={`flex flex-col md:px-40 ${className} ${showMenu && 'fixed'}`}>
        {children}
      </main>
      <footer className="flex pt-40 pb-20 justify-center" />
    </>
  );
}
