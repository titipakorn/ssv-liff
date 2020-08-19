import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import apolloClient from './lib/apollo';
import Main from './components/Main'
const LIFF = window.liff


function App() {
  let [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    LIFF
      .init({ liffId: process.env.REACT_APP_LIFF_ID })
      .then(() => {
        setReady(true)
      })
      .catch((err) => {
        console.log(err)
      });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      {!ready && <div>Loading...</div>}
      {ready && <Main liff={LIFF} />}
    </ApolloProvider>
  );
}

export default App;
