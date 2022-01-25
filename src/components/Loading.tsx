import Image from 'next/image';
import Layout from './Layout';

export default function Loading() {
  return (
    <Layout className="flex h-screen justify-center">
      <div className="absolute self-center loading top-1/3">
        <Image src="/scream-blue-pink.png" width={200} height={200} alt="loading" />
      </div>
    </Layout>
  );
}
