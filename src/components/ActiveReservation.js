import React from 'react'
import gql from 'graphql-tag';
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks';
import { displayDatetime } from '../lib/day'


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

`


function ReservationCard({ items }) {
  if (items.length === 0) {
    return <div>There is no reservation yet.</div>
  }

  const { from, to, reserved_at } = items[0]
  return (
    <Card className="card">
      <div className="card-content">
      <progress className="progress is-small is-primary" max="100">15%</progress>
        <div className="From">
          {from}
        </div>
        <div className="To">
          {to}
          <br />
          {displayDatetime (reserved_at)}
        </div>
      </div>
      {/* <footer className="card-footer">
        <p className="card-footer-item">
          <span>
            View on <a href="https://twitter.com/codinghorror/status/506010907021828096">Twitter</a>
          </span>
        </p>
        <p className="card-footer-item">
          <span>
            Share on <a href="#">Facebook</a>
          </span>
        </p>
      </footer> */}
    </Card>
  )
}

export default function ActiveReservation({ userID }) {

  const { loading, error, data } = useSubscription(ACTIVE_TRIP, {
    shouldResubscribe: true,
    variables: { userID: userID },
    skip: !userID,
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>error... {error.message}</div>}
      {data && <div><ReservationCard items={data.trip} /></div>}
    </>
  )


}