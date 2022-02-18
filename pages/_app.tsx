import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import GlobalProvider from '../src/contexts/GlobalContext';

export const screamClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/screamsh/scream-v1',
  cache: new InMemoryCache({
    typePolicies: {
      Market: {
        keyFields: ['id', 'reserves'],
      },
    },
  }),
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={screamClient}>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </ApolloProvider>
  );
}
