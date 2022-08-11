import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { useSubscription } from '@apollo/react-hooks';
import dayjs from 'dayjs';
import { displayTime, displayDatetime } from '../lib/day';
import './ActiveReservation.css';
import Map from './Map';
import MMap from './MMap';
import Pin from './MapComponents/Pin';
import useAnalyticsEventTracker from '../lib/useAnalyticsEventTracker';
const faye = require('faye');
var client = new faye.Client('https://ssv-one.10z.dev/faye/faye');

async function getLastestLocation(driver) {
  const resp = await fetch('https://ssv-one.10z.dev/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `queryGetLastLocation($driver: String){
        log_traces(limit: 1,
        order_by: {
          timestamp: desc
        },
        where: {
          driver_name: {
            _eq: $driver
          }
        }){
          point,
          timestamp
        }
      }`,
      variables: {
        driver,
      },
    }),
  });
  const json = await resp.json();
  return json;
}

export default function ActiveReservation({ userID, liff }) {
  const { loading, error, data } = useSubscription(ACTIVE_TRIP, {
    shouldResubscribe: true,
    variables: { userID: userID },
    skip: !userID,
  });
  const { data: shiftData } = useSubscription(ACTIVE_WORKING_SHIFT, {
    shouldResubscribe: true,
    variables: { day: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ') },
  });
  const { data: activeTrips } = useSubscription(ACTIVE_TRIPS);

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>error... {error.message}</div>}
      {data && (data.trip ?? []).length > 0 ? (
        <div>
          <ReservationCard items={data.trip} liff={liff} shiftData={shiftData} activeTrips={activeTrips} />
        </div>
      ) : (
        <div>
           <ul>
          {shiftData &&
            shiftData.items.map((item) => (
              <li style={{display: 'inline-block'}}>
                <Pin color={item?.vehicle?.color} normal={false} /> <span style={{border: '1px solid black',padding: '1px'}}>{item?.driver?.username}{' '}
                {activeTrips
                  ? activeTrips?.trip.filter((v) => v.driver?.username === item?.driver?.username)
                      .length > 0
                    ? '(Busy)'
                    : '(Vacant)'
                  : '(...)'}</span>
              </li>
            ))}
        </ul>
          <MonitorMap data={shiftData} />
        </div>
      )}
    </>
  );
}

function MonitorMap({ origin, destination, data }) {
  const [drivers, setDriver] = useState({});
  const [locationDrivers, setLocationDriver] = useState({});
  const [driverState, setDriverState] = useState({});
  useEffect(() => {
    client.subscribe(`/driver_locations`, function (message) {
      const {
        driver,
        coords: { latitude, longitude },
        timestamp,
      } = message;
      setDriver({
        driver,
        latitude,
        longitude,
        timestamp,
      });
    });
  }, []);
  useEffect(() => {
    if ('driver' in drivers) {
      const { driver, latitude, longitude, timestamp } = drivers;
      setLocationDriver({
        ...locationDrivers,
        [driver]: { latitude, longitude, timestamp },
      });
    }
  }, [drivers]);

  useEffect(() => {
    if (data) {
      const dState = Object.fromEntries(
        data.items.map((item) => {
          return [item?.driver?.username, item?.vehicle?.color];
        })
      );
      async function fetchData() {
        const ddStates = Object.fromEntries(
          await Promise.all(
            Object.keys(dState).map(async (item) => {
              const locationData = await getLastestLocation(item);
              const [locationPoint] = locationData?.data?.log_traces ?? [];
              return [
                item,
                {
                  latitude: locationPoint?.point?.coordinates[1] ?? 0,
                  longitude: locationPoint?.point?.coordinates[0] ?? 0,
                  timestamp: locationPoint?.timestamp,
                },
              ];
            })
          )
        );
        setLocationDriver(ddStates);
      }
      fetchData();
      setDriverState(dState);
    }
  }, [data]);

  return (
    <MapContainer>
      <MMap
        coords={locationDrivers}
        drivers={driverState}
        origin={origin}
        destination={destination}
      />
    </MapContainer>
  );
}
function ReservationCard({ items, liff,activeTrips,shiftData }) {
  const {
    id,
    from,
    to,
    reserved_at,
    accepted_at,
    picked_up_at,
    dropped_off_at,
    traces,
    place_to,
    place_from,
    driver,
  } = items[0];
  const gaEventTracker = useAnalyticsEventTracker('ActiveReservation');
  const [mapVisible, toggleMap] = React.useState(false);
  const [driverLocation, setDriver] = React.useState({});

  useEffect(() => {
    if (driver) {
      client.subscribe(`/driver_locations/${driver.username}`, function (message) {
        const {
          coords: { latitude, longitude },
          timestamp,
        } = message;
        setDriver({
          latitude,
          longitude,
          timestamp,
        });
      });
    }
  }, [driver]);

  if (items.length === 0) {
    return <div>There is no reservation yet.</div>;
  }

  let step = 1;
  let status = 'Wait for accept job';
  if (dropped_off_at !== null) {
    status = 'Done';
    step = 4;
  } else if (picked_up_at !== null) {
    status = 'On SSV';
    step = 3;
  } else if (accepted_at !== null) {
    step = 2;
    status = 'Wait for pickup';
  }
  const isInLineApp = liff.isInClient();

  return (
    <Card className="card">
      <div className="card-content">
        <ul className="steps is-small">
          <li className="step-item is-completed is-success">
            <div className="step-marker">
              <span className="icon">
                <i className="fa fa-check"></i>
              </span>
            </div>
            <div className="step-details is-completed">
              <p className="step-title">Step 1</p>
              <p>Reservation</p>
              <p>{displayTime(reserved_at)}</p>
            </div>
          </li>
          <li className={`step-item is-success ${step > 1 ? 'is-completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-details">
              <p className="step-title">Step 2</p>
              <p>Reservation accepted</p>
              {accepted_at && <p>{displayTime(accepted_at)}</p>}
            </div>
          </li>
          <li className={`step-item is-success ${step > 2 ? 'is-completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-details">
              <p className="step-title">Step 3</p>
              <p>Picked up</p>
              {picked_up_at && <p>{displayTime(picked_up_at)}</p>}
            </div>
          </li>
          <li className={`step-item is-success ${step > 3 ? 'is-completed' : ''}`}>
            <div className="step-marker"></div>
            <div className="step-details">
              <p className="step-title">Step 4</p>
              <p>Dropped off</p>
              {dropped_off_at && <p>{displayTime(dropped_off_at)}</p>}
            </div>
          </li>
          {items[0].cancelled_at}
        </ul>

        <ul>
          {shiftData &&
            shiftData.items.map((item) => (
              <li style={{display: 'inline-block'}}>
                <Pin color={item?.vehicle?.color} normal={false} /> <span style={{border: '1px solid black',padding: '1px'}}>{item?.driver?.username}{' '}
                {activeTrips
                  ? activeTrips?.trip.filter((v) => v.driver?.username === item?.driver?.username)
                      .length > 0
                    ? '(Busy)'
                    : '(Vacant)'
                  : '(...)'}</span>
              </li>
            ))}
        </ul>

        <div className="has-text-right">
          <button
            className="button is-small is-light"
            onClick={() => {
              gaEventTracker('Toggle_Map', `${!mapVisible}`);
              toggleMap(!mapVisible);
            }}
          >
            Map
          </button>
        </div>

        {mapVisible && step > 1 ? (
          <>
            <MapContainer>
              <Map
                origin={place_from}
                destination={place_to}
                traces={traces}
                coords={driverLocation}
              />
            </MapContainer>
          </>
        ) : (
          <MonitorMap origin={place_from} destination={place_to} data={shiftData} />
        )}
        <div className="JobID">{id}</div>
        <div className="From">{from}</div>
        <div className="To">{to}</div>
        <div className="When">{displayDatetime(reserved_at)}</div>
        <div className="Status">{`${status} ${
          driver ? (driver?.username ? `by ${driver?.username}` : '') : ''
        }`}</div>
      </div>

      {step < 2 && (
        <footer className="card-footer">
          <p className="card-footer-item">
            {isInLineApp && (
              <button
                className="button is-light"
                onClick={() => {
                  liff
                    .sendMessages([
                      {
                        type: 'text',
                        text: '[LIFF] Cancel',
                      },
                    ])
                    .then(function () {
                      window.alert('Message sent');
                    })
                    .catch(function (error) {
                      window.alert('Error sending message: ' + error);
                    });
                }}
              >
                Cancel
              </button>
            )}
            {!isInLineApp && <span>Type "cancel" in Line to cancel</span>}
          </p>
        </footer>
      )}
    </Card>
  );
}

const ACTIVE_WORKING_SHIFT = gql`
  subscription ACTIVE_WORKING_SHIFT($day: timestamptz) {
    items: working_shift(
      where: { _and: [{ _or: [{ start: { _gte: $day } }] }, { end: { _is_null: true } }] }
    ) {
      id
      start
      latest_timestamp
      vehicle {
        name
        license_plate
        color
      }
      driver {
        username
      }
    }
  }
`;

const ACTIVE_TRIPS = gql`
  subscription ACTIVE_TRIPS {
    trip(
      where: {
        _and: [{ dropped_off_at: { _is_null: true } }, { cancelled_at: { _is_null: true } }]
      }
      order_by: { reserved_at: desc }
    ) {
      driver {
        username
      }
    }
  }
`;

const ACTIVE_TRIP = gql`
  subscription ACTIVE_TRIP($userID: String!) {
    trip(
      limit: 1
      where: {
        _and: [
          { user: { line_user_id: { _eq: $userID } } }
          { dropped_off_at: { _is_null: true } }
          { cancelled_at: { _is_null: true } }
        ]
      }
      order_by: { reserved_at: desc }
    ) {
      id
      from
      to
      place_from
      place_to
      reserved_at
      accepted_at
      picked_up_at
      dropped_off_at
      cancelled_at
      driver {
        username
      }
      traces(limit: 1, order_by: { created_at: desc }) {
        point
        speed
        heading
        timestamp
      }
    }
  }
`;

const Card = styled.div`
  text-align: left;

  div.JobID {
    width: 100%;
    margin-top: 1rem;
    font-size: 1.3rem;

    ::before {
      content: 'Job ID';
      margin-right: 1rem;
      color: #aaa;
      font-size: 0.9rem;
    }
  }

  div.From {
    width: 100%;
    font-size: 1.8rem;

    ::before {
      content: 'Pickup at';
      margin-right: 1rem;
      color: #aaa;
      font-size: 0.9rem;
    }
  }

  div.To {
    font-size: 1.3rem;
    color: #666;

    ::before {
      content: 'Destination';
      margin-right: 1rem;
      color: #aaa;
      font-size: 0.9rem;
    }
  }

  div.When {
    font-size: 1.3rem;
    color: #666;

    ::before {
      content: 'On';
      margin-right: 1rem;
      color: #aaa;
      font-size: 0.9rem;
    }
  }

  div.Status {
    font-size: 1.3rem;
    color: #666;

    ::before {
      content: 'Status';
      margin-right: 1rem;
      color: #aaa;
      font-size: 0.9rem;
    }
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
`;
