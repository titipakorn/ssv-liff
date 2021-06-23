import React from 'react'
import gql from 'graphql-tag';
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks';
import { displayTime, displayDatetime, agoFormat } from '../lib/day'
import './ActiveReservation.css'
import Map from './Map'


export default function ActiveReservation({ userID, liff }) {

  const { loading, error, data } = useSubscription(ACTIVE_TRIP, {
    shouldResubscribe: true,
    variables: { userID: userID },
    skip: !userID,
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>error... {error.message}</div>}
      {data && <div><ReservationCard items={data.trip} liff={liff} /></div>}
    </>
  )

}

function ReservationCard({ items, liff }) {
  const [mapVisible, toggleMap] = React.useState(false)
  if (items.length === 0) {
    return <div>There is no reservation yet.</div>
  }

  const { from, to, reserved_at,
    accepted_at,
    picked_up_at,
    dropped_off_at,
    traces,
    place_to,
    place_from,
  } = items[0]

  let step = 1
  if (dropped_off_at !== null) {
    step = 4
  } else if (picked_up_at !== null) {
    step = 3
  } else if (accepted_at !== null) {
    step = 2
  }

  const isInLineApp = liff.isInClient()

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

        <div className="has-text-right">
          <button className="button is-small is-light" onClick={() => {
            toggleMap(!mapVisible)
          }} >Map</button>
        </div>

        {mapVisible && (
          <>
            {traces.length > 0 && <Small>updated: {agoFormat(traces[0].timestamp)}</Small>}
            <MapContainer>
              <Map origin={place_from} destination={place_to} traces={traces} />
            </MapContainer>
          </>
        )}

        <div className="From">
          {from}
        </div>
        <div className="To">
          {to}
        </div>
        <div className="When">
          {displayDatetime(reserved_at)}
        </div>
      </div>

      {step < 2 && (<footer className="card-footer">
        <p className="card-footer-item">
          {isInLineApp && (
            <button className="button is-light" onClick={() => {
              liff.sendMessages([{
                'type': 'text',
                'text': "[LIFF] Cancel"
              }]).then(function () {
                window.alert('Message sent');
              }).catch(function (error) {
                window.alert('Error sending message: ' + error);
              });
            }} >Cancel</button>
          )}
          {!isInLineApp && (
            <span>Type "cancel" in Line to cancel</span>
          )}
        </p>
      </footer>)}
    </Card>
  )
}

const ACTIVE_TRIP = gql`
    subscription ACTIVE_TRIP($userID: String!) {
    trip (
      limit: 1
      where: {
        _and: [
          {user: {line_user_id: {_eq: $userID}}},
          {dropped_off_at: {_is_null: true}},
          {cancelled_at: {_is_null: true}}
        ]
      }
      order_by: {
        reserved_at: desc
      }
    ) {
      from
      to
      place_from
      place_to
      reserved_at
      accepted_at
      picked_up_at
      dropped_off_at
      cancelled_at
      traces (limit: 1, order_by: {created_at:desc}) {
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

div.From {
  width: 100%;
  font-size: 2rem;

  ::before {
    content: "Pickup at";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.9rem;
  }
}

div.To {
  font-size: 1.3rem;
  color: #666;

  ::before {
    content: "Destination";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.9rem;
  }
}

div.When {
  font-size: 1.3rem;
  color: #666;

  ::before {
    content: "On";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.9rem;
  }
}
`

const MapContainer = styled.div`
width: 100%;
height: 200px;
`

const Small = styled.div`
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
`