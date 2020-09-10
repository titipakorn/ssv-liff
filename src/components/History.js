import React from 'react'
import gql from 'graphql-tag';
import styled from 'styled-components'
import { useSubscription } from '@apollo/react-hooks';
import dayjs from 'dayjs'
import { displayDatetime } from '../lib/day'
import './ActiveReservation.css'
import star from './star.svg';

const TRIP_HISTORY = gql`
    subscription TRIP_HISTORY($userID: String!) {
    trip (
      where: {
        user: {line_user_id: {_eq: $userID}},
        _or: [
          {dropped_off_at: {_is_null: false}},
          {cancelled_at: {_is_null: false}}
        ]
      }
      order_by: {
        reserved_at: desc
      }
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
      user_feedback
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

.card-content {
  padding: 10px;
}

.card-content.cancelled {
  background: #DDDDDDAA;

  ::after {
    content: "CANCELLED";
    color: #dd7777aa;
  }
}

div.From {
  font-size: 0.9rem;
  color: #666;

  ::before {
    content: "From";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.8rem;
    font-weight: 100;
  }
}

div.To {
  font-size: 1rem;
  font-weight: 450;

  ::before {
    content: "To";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.8rem;
    font-weight: 100;
  }
}

div.When {
  font-size: 0.9rem;
  color: #666;

  ::before {
    content: "On";
    margin-right: 1rem;
    color: #aaa;
    font-size: 0.8rem;
    font-weight: 100;
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

const InlineList = styled.ul`
  display: inline;
  clear: both;

  img.star {
    width: 25px;
    height: 25px;
    margin-right: 2px;
  }
`

const Center = styled.div`
text-align: center;
`

function Stars({ num }) {
  return <Center>
    <InlineList>
      {[...Array(num).keys()].map(i => <img key={`s:${i}`} src={star} className="star" alt="star" />)}
    </InlineList>
  </Center>
}

function TripItem({ item }) {
  const { from, to, reserved_at,
    picked_up_at,
    dropped_off_at,
    user_feedback,
    cancelled_at,
  } = item
  let diff = (dayjs(dropped_off_at) - dayjs(picked_up_at)) / 1000 / 60
  if (isNaN(diff)) diff = 0
  return (
    <Card className="card">
      <div className={`card-content ${cancelled_at && 'cancelled'}`}>
        <div className="From">
          {from}
        </div>
        <div className="To">
          {to}
        </div>
        <div className="When">
          {displayDatetime(reserved_at)} ({diff.toFixed(0)} min trip)
        </div>
        {user_feedback && <Stars num={user_feedback} />}
      </div>
    </Card>
  )
}

export default function ActiveReservation({ userID, liff }) {

  const { loading, error, data } = useSubscription(TRIP_HISTORY, {
    shouldResubscribe: true,
    variables: { userID: userID },
    skip: !userID,
  });

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>error... {error.message}</div>}
      {data && data.trip && <div>{data.trip.map(trip => <TripItem key={trip.id} item={trip} liff={liff} />)}</div>}
    </>
  )


}