import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import logo from './logo.svg';
import './App.css';
import apolloClient from './lib/apollo';
const LIFF = window.liff


function App({ liff }) {
  const [profile, setProfile] = React.useState({})
  const isLoggedIn = liff.isLoggedIn()

  React.useEffect(() => {
    liff
      .getProfile().then(profile => {
        // https://developers.line.biz/en/reference/liff/#get-profile
        // userId, displayName, pictureUrl, statusMessage
        setProfile(profile)
      })
      .catch((err) => {
        console.log('getProfile error', err);
      });

  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <ul>
          <li>Language: {liff.getLanguage()}</li>
          <li>LIFF Version: {liff.getVersion()}</li>
          <li>LINE Version: {liff.getLineVersion() || '-'}</li>
          <li>In client: {liff.isInClient() ? 'Yes' : 'No'}</li>
          <li>OS: {liff.getOS()}</li>
        </ul>
        {!isLoggedIn && <div>
          <button onClick={() => { liff.login() }}>Log in</button>
        </div>}
        {profile.userId && <ul>
          <li>userID: {profile.userId}</li>
          <li>displayName: {profile.displayName}</li>
        </ul>}
        {isLoggedIn && <div>
          <button onClick={() => { liff.logout() }}>Log OUT</button>
        </div>}
      </header>
    </div>
  )
}


function AppContainer() {
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
      {ready && <App liff={LIFF} />}
    </ApolloProvider>
  );
}

export default AppContainer;
