import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL from 'react-map-gl'; // Popup // CanvasOverlay, // SVGOverlay, // FlyToInterpolator, // LinearInterpolator,
import styled from 'styled-components';
import Marker from './MapComponents/Marker';

// added the following 6 lines.
import mapboxgl from 'mapbox-gl';

if (process.env.NODE_ENV === 'production') {
  // The following is required to stop "npm build" from transpiling mapbox code.
  // notice the exclamation point in the import.
  // @ts-ignore
  // eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
  mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
}

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export default function Map({ coords, drivers, origin, destination }) {
  const [pointData, setPointData] = useState({});
  useEffect(() => {
    const animation = window.requestAnimationFrame(() => setPointData(coords));
    return () => window.cancelAnimationFrame(animation);
  }, [coords]);

  const [viewport, setViewport] = useState({
    latitude: 13.745993,
    longitude: 100.57808,
    zoom: 13,
    transitionDuration: 200,
  });

  return (
    <>
      <MapContainer>
        <ReactMapGL
          {...viewport}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onViewportChange={(vp) => setViewport(vp)}
          reuseMaps={true}
          width="100%"
          height="100vh"
          onClick={({ lngLat }) => {
            console.log(lngLat);
          }}
        >
          {!origin && (<Marker lat={13.7447328859144} icon={'start'} lon={100.572538842281} color={'#006400'} />
          )}
          {Object.keys(pointData).map(
            (v) =>
              drivers[v] && (
                <Marker
                  key={`marker_${v}`}
                  lat={pointData[v]?.latitude ?? 0}
                  lon={pointData[v]?.longitude ?? 0}
                  color={drivers[v] ?? '#00008b'}
                />
              )
          )}
                   {origin && (
            <Marker
              icon="start"
              color={'#4fce06'}
              lat={origin.coordinates[1]}
              lon={origin.coordinates[0]}
            />
          )}
          {destination && (
            <Marker
              icon="end"
              color={'#dd4444'}
              lat={destination.coordinates[1]}
              lon={destination.coordinates[0]}
            />
          )}
        </ReactMapGL>
      </MapContainer>
    </>
  );
}
