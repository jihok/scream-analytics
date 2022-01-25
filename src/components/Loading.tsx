import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex h-screen justify-center">
      <div className="fixed self-center loading top-1/3">
        <Image src="/scream-blue-pink.png" width={200} height={200} alt="loading" priority />
      </div>
    </div>
  );
}
