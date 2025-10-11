import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const GRAPHQL_URL = 'http://127.0.0.1:8000/graphql';

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});

export default client;