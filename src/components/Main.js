import React from "react"
import {
  Switch, Route, Link, useLocation
} from "react-router-dom"
import '../App.css';
import ActiveReservation from './ActiveReservation'
import Registration from './Registration'
import Help from './Help'
import History from './History'
import Page404 from './Page404'
import ReactGA from 'react-ga4';

export default function Main(props) {
  const { liff } = props
  // console.log(props)
  const [profile, setProfile] = React.useState({})
  const isLoggedIn = liff.isLoggedIn()
  const { pathname } = useLocation();

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


  React.useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
  }, []);

  // console.log(profile)
  return (
    <div className="App">
      <div className="tabs is-fullwidth">
        <ul>
          <li className={`${pathname === "/" && "is-active"}`}>
            <Link to="/">
              <span>Registration</span>
            </Link>
          </li>
          <li className={`${pathname === "/trip" && "is-active"}`}>
            <Link to="/trip">
              <span>Trip</span>
            </Link>
          </li>
          <li className={`${pathname === "/history" && "is-active"}`}>
            <Link to="/history">
              <span>History</span>
            </Link>
          </li>
          <li className={`${pathname === "/help" && "is-active"}`}>
            <Link to="/help">
              <span>Help</span>
            </Link>
          </li>
        </ul>
      </div>
      {!isLoggedIn && <div>
        <button className="button is-warning is-rounded" onClick={() => { liff.login() }}>Log in</button>
      </div>}
      {/* {profile.userId && <div> Hi, {profile.displayName}</div>} */}
      <Switch>
        <Route exact path="/help" component={() => <Help liff={liff} />} />
        <Route exact path="/history" component={() => <History userID={profile.userId} liff={liff} />} />
        <Route exact path="/trip" component={() => <ActiveReservation userID={profile.userId} liff={liff} />} />
        <Route exact path="/" component={() => <Registration userID={profile.userId} liff={liff} displayName={profile.displayName} profileURL={profile.pictureUrl} />} />
        <Route path="*" component={Page404} />
      </Switch>

    </div>
  )
}
