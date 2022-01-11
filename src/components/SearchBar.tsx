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
