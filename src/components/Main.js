import React from "react"
import { Switch, Route, Link } from "react-router-dom"
import '../App.css';
import ActiveReservation from './ActiveReservation'
import About from './About'
import Page404 from './Page404'

export default function Main(props) {
  const { liff } = props
  console.log(props)
  const [profile, setProfile] = React.useState({})
  const isLoggedIn = liff.isLoggedIn()

  React.useEffect(() => {
    if (isLoggedIn)
      liff
        .getProfile().then(profile => {
          // https://developers.line.biz/en/reference/liff/#get-profile
          // userId, displayName, pictureUrl, statusMessage
          setProfile(profile)
        })
        .catch((err) => {
          console.log('getProfile error', err);
        });

  }, [liff, isLoggedIn])

  return (
    <div className="App">
      <div className="tabs is-fullwidth">
        <ul>
          <li className="is-active">
            <Link to="/">
              <span className="icon is-small"><i className="fas fa-home"></i></span>
              <span>Trip</span>
            </Link>
          </li>
          <li className="">
            <Link to="/about">
              <span className="icon is-small"><i className="fas fa-image"></i></span>
              <span>About</span>
            </Link>
          </li>
        </ul>
      </div>
      <div>
        {!isLoggedIn && <div>
          <button className="button is-warning is-rounded" onClick={() => { liff.login() }}>Log in</button>
        </div>}
        {profile.userId && <div> Hi, {profile.displayName}</div>}
      </div>
      <Switch>
        <Route exact path="/about" component={() => <About liff={liff} />} />
        <Route exact path="/" component={() => <ActiveReservation userID={profile.userId} liff={liff} />} />
        <Route path="*" component={Page404} />
      </Switch>

    </div>
  )
}
