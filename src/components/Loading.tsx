import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex h-screen justify-center">
      <div className="fixed self-center loading top-1/3">
        <Image
          src="/images/scream-black-white.png"
          width={150}
          height={150}
          alt="loading"
          priority
        />
      </div>
    </div>
  );
}
