import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function SearchBar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex w-full border border-border-active rounded-full text-body py-1 px-6">
      <input
        type="text"
        className="w-full"
        placeholder="Search for an account..."
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value);
        }}
        onKeyUp={async (event) => {
          if (event.key === 'Enter') {
            await router.push(`/account/${searchTerm}`);
          }
        }}
      />
      <button className="pl-2" type="submit" disabled={!searchTerm}>
        <Image
          src="/images/Search.png"
          alt="menu"
          width={23}
          height={23}
          onClick={async () => {
            if (searchTerm) await router.push(`/account/${searchTerm}`);
          }}
        />
      </button>
    </div>
  );
}
