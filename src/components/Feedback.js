import React from 'react'
import styled from 'styled-components'
import Rating from 'react-rating'
import star from './star.svg';
import starWhite from './star-white.svg';

const Img = styled.img`
height: 25px;
width: 25px;
margin-right: 2px;
`

const Center = styled.div`
margin-top: 10px;
text-align: center;
`

const Muted = styled.span`
 font-size: 0.9rem;
 color: #e66;
 font-style: italic;
`



export default function Feedback({ ID, liff, closeFeedback }) {
  const [err, setErrMsg] = React.useState(null)
  const isInLineApp = liff.isInClient()
  console.log(closeFeedback)
  function handleToggler() {
    closeFeedback()
  }

  if (!isInLineApp) {
    return <Center>
      <Muted>
        Open from LINE app to give feedback
      </Muted>
    </Center>
  }

  return (
    <Center>
      {err && <Muted>{err}</Muted>}
      <Rating
        readonly={!ID}
        start={0} stop={5} step={1} initialRating={3}
        fullSymbol={<Img src={star} className="star" alt="+1" />}
        emptySymbol={<Img src={starWhite} className="star" alt="" />}
        onChange={ratingValue => {
          setErrMsg(null)
          liff.sendMessages([{
            'type': 'text',
            'text': `[LIFF] feedback on trip ${ID} => ${ratingValue}`
          }]).then(function () {
            setTimeout(() => {
              closeFeedback()
            }, 100)
          }).catch(function (error) {
            setErrMsg(`Err: ${error}`)
          });
        }} />
    </Center>
  )
}