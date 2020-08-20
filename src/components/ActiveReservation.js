import React from 'react'
import gql from 'graphql-tag';
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks';
import { displayTime, displayDate } from '../lib/day'
import './ActiveReservation.css'

const ACTIVE_TRIP = gql`
    subscription ACTIVE_TRIP($userID: String!) {
    trip (
      limit: 1
      where: {
        user: {
          line_user_id: {_eq: $userID}
        }
      }
      order_by: {
        reserved_at: desc
      }
    ) {
      from
      to
      reserved_at
      accepted_at
      picked_up_at
      dropped_off_at
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


function ReservationCard({ items, liff }) {
  if (items.length === 0) {
    return <div>There is no reservation yet.</div>
  }

  const { from, to, reserved_at,
    accepted_at,
    picked_up_at,
    dropped_off_at } = items[0]

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
        <ul class="steps is-small">
          <li class="step-item is-completed is-success">
            <div class="step-marker">
              <span class="icon">
                <i class="fa fa-check"></i>
              </span>
            </div>
            <div class="step-details is-completed">
              <p class="step-title">Step 1</p>
              <p>Reservation</p>
              <p>{displayTime(reserved_at)}</p>
            </div>
          </li>
          <li class={`step-item is-success ${step > 1 ? 'is-completed' : ''}`}>
            <div class="step-marker"></div>
            <div class="step-details">
              <p class="step-title">Step 2</p>
              <p>Reservation accepted</p>
              {accepted_at && <p>{displayTime(accepted_at)}</p>}
            </div>
          </li>
          <li class={`step-item is-success ${step > 2 ? 'is-completed' : ''}`}>
            <div class="step-marker"></div>
            <div class="step-details">
              <p class="step-title">Step 3</p>
              <p>Picked up</p>
              {picked_up_at && <p>{displayTime(picked_up_at)}</p>}
            </div>
          </li>
          <li class={`step-item is-success ${step > 3 ? 'is-completed' : ''}`}>
            <div class="step-marker"></div>
            <div class="step-details">
              <p class="step-title">Step 4</p>
              <p>Dropped off</p>
              {dropped_off_at && <p>{displayTime(dropped_off_at)}</p>}
            </div>
          </li>
        </ul>

        <div className="From">
          {from}
        </div>
        <div className="To">
          {to}
        </div>
        <div className="When">
          {displayDate(reserved_at)}
        </div>
      </div>
      <footer className="card-footer">
        <p className="card-footer-item">
          {(step < 2 && isInLineApp) && (
            <button onClick={() => {
              liff.sendMessages([{
                'type': 'text',
                'text': "Cancel"
              }]).then(function () {
                window.alert('Message sent');
              }).catch(function (error) {
                window.alert('Error sending message: ' + error);
              });
            }} >Cancel</button>
          )}
          {(step < 2 && !isInLineApp) && (
            <span>Type "cancel" in Line to cancel</span>
          )}
        </p>
      </footer>
    </Card>
  )
}

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