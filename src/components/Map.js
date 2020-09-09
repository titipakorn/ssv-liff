import React, { useState } from "react"
import ReactMapGL, {
  // LinearInterpolator,
  // FlyToInterpolator,
  // SVGOverlay,
  // CanvasOverlay,
  // Popup
} from "react-map-gl"
import styled from "styled-components"
import Marker from './MapComponents/Marker'

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`

export default function Map({ traces, origin, destination }) {
  const [driver, setDriver] = useState({
    latitude: 13.745993, longitude: 100.578080
  })
  const [viewport, setViewport] = useState({
    latitude: 13.745993,
    longitude: 100.578080,
    zoom: 13,
    // transitionInterpolator: new LinearInterpolator({
    //   around: [event.offsetCenter.x, event.offsetCenter.y]
    // }),
    transitionDuration: 200
  })

  React.useEffect(() => {

    if (traces && traces.length > 0) {
      const t = traces[0]
      const crd = t.point.coordinates
      const { latitude, longitude } = driver
      // never set the same viewport/driver's location repeatedly
      if (crd[1] === latitude && crd[0] === longitude) {
        return
      }

      setViewport({
        ...viewport,
        latitude: crd[1],
        longitude: crd[0],
      })

      setDriver({
        latitude: crd[1],
        longitude: crd[0],
      })
    }

  }, [driver, traces, viewport])

  return (
    <MapContainer>
      {/* <MapControl moveToCurrentLoc={this._moveToCurrLocation} /> */}
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={vp => setViewport(vp)}
        reuseMaps={true}
        width="100%"
        height="100%"
        onClick={({ lngLat }) => {
          console.log(lngLat)
        }}
      >
        {driver.latitude !== 0 && <Marker lat={driver.latitude} lon={driver.longitude} />}
        {origin && <Marker icon="start" color={'#4fce06'} lat={origin.coordinates[1]} lon={origin.coordinates[0]} />}
        {destination && <Marker icon="end" color={'#dd4444'} lat={destination.coordinates[1]} lon={destination.coordinates[0]} />}
      </ReactMapGL>
    </MapContainer>
  )
}