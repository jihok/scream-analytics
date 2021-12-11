import { useRouter } from 'next/router';

export default function Account() {
  const {
    query: { id },
  } = useRouter();

  return <div>{id}</div>;
}
