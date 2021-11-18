import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import GlobalProvider from '../src/contexts/GlobalContext';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/screamsh/scream-v1',
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </ApolloProvider>
  );
}

export default MyApp;
