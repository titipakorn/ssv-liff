import React, { useState } from "react"
import 'mapbox-gl/dist/mapbox-gl.css';
// import ReactMapGL, {
//   // LinearInterpolator,
//   // FlyToInterpolator,
//   // SVGOverlay,
//   // CanvasOverlay,
//   // Popup
// } from "react-map-gl"
import ReactMapGL, { WebMercatorViewport } from 'react-map-gl'
import styled from "styled-components"
import Marker from './MapComponents/Marker'

// added the following 6 lines.
import mapboxgl from 'mapbox-gl';

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`

const applyToArray = (func, array) => func.apply(Math, array)

const getBoundsForPoints = (points) => {
  // Calculate corner values of bounds
  if(points.length>1){
  const pointsLong = points.map(point => point.point.coordinates[0])
  const pointsLat = points.map(point => point.point.coordinates[1])
  const cornersLongLat = [
    [applyToArray(Math.min, pointsLong), applyToArray(Math.min, pointsLat)],
    [applyToArray(Math.max, pointsLong), applyToArray(Math.max, pointsLat)]
  ]
  // Use WebMercatorViewport to get center longitude/latitude and zoom
  const viewport = new WebMercatorViewport({ width: 400, height: 400 })
    .fitBounds(cornersLongLat, { padding: 165 }) // Can also use option: offset: [0, -100]
  const { longitude, latitude, zoom } = viewport
  console.log(zoom,cornersLongLat,points);
  return { longitude, latitude, zoom }
}else{
     return { latitude: 13.745993,
    longitude: 100.578080,
    zoom: 14}
}

}

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
      const points = [...traces];
      if (origin&&destination) {
        points.push({point:{coordinates:origin.coordinates}});
        points.push({point:{coordinates:destination.coordinates}});
      }
      const bounds = getBoundsForPoints(points)
      console.log('BOUNDS',bounds)
      const t = traces[0]
      const crd = t.point.coordinates
      const { latitude, longitude } = driver
      // never set the same viewport/driver's location repeatedly
      if (crd[1] === latitude && crd[0] === longitude) {
        return
      }

      setViewport({
        ...viewport,
        ...bounds,
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