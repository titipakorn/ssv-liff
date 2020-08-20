import React from "react"
import { Marker } from "react-map-gl"
import Pin from "./Pin"


export default function MyMarker(props) {
  const {
    size = 30,
    lat,
    lon,
    color,
    draggable = false,
    onDragEnd
  } = props
  const ccolor = color ? color : '#28adff'
  if (!lat || !lon) {
    return <></>
  }
  return (
    <Marker
      latitude={+lat}
      longitude={+lon}
      offsetLeft={0}
      offsetTop={0}
      draggable={draggable}
      onDragEnd={onDragEnd}
    >
      <Pin size={size} color={ccolor}>
        You are here
      </Pin>
    </Marker>
  )
}
