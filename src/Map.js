
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css'
import React,{ useContext, useEffect, useState} from 'react';
import { mapData } from './Location';
import L from 'leaflet'
import './Map.css'
import MarkerClusterGroup from 'react-leaflet-cluster'

import source from './source.png'
import destination from './destination.png'
import tol from './toll.png'




const Map=()=> {
  const data = useContext(mapData);
  const strtCoordinates = data.strtCoordinates;
  const route = data.tempData
  const tolls = data.tolls; 
  const endCoordinates = data.endCoordinates
  
  const src = new L.Icon({
    iconUrl:source,
    iconSize: [25, 33],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
  });

  const tll = new L.Icon({
    iconUrl:tol,
    iconSize: [25, 33],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
  });

  const dest = new L.Icon({
    iconUrl:destination,
    iconSize: [25, 33],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
  });

  const [hasFlownToStart, setHasFlownToStart] = useState(false);

  const MyComponent = () => {
    const map = useMap();

    useEffect(() => {
      if (strtCoordinates && !hasFlownToStart) {
        // Calculate the center of the path between source and destination
        const centerLat = (strtCoordinates[0] + endCoordinates[0]) / 2;
        const centerLng = (strtCoordinates[1] + endCoordinates[1]) / 2;

        // Calculate the zoom level based on the route's bounds
        const bounds = L.latLngBounds(route);
        const zoomLevel = map.getBoundsZoom(bounds);

        // Fly to the calculated center with the calculated zoom level
        map.flyTo([centerLat, centerLng], zoomLevel);

        // Update state to indicate that the flyTo action has been triggered
        setHasFlownToStart(true);
      }
    }, [map]);

    return null; // This component doesn't render anything
  };

  return (
    <MapContainer center={[20.593683, 78.962883]} zoom={5} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
        
      {strtCoordinates &&
        (
          <> <Marker position={[strtCoordinates[0], strtCoordinates[1]]} icon={src}>
              <Popup>
                 Starting Location<br></br>
              </Popup>
          </Marker>
          <Marker position={[endCoordinates[0], endCoordinates[1]]} icon={dest}>
              <Popup>
                Ending Location<br></br>
              </Popup>
            </Marker></>
        )};
      <Polyline positions={route} color='blue' />
      
      <MarkerClusterGroup>
      {tolls &&
        tolls.map((toll) => {
          if (toll.start && toll.start.lat !== undefined && toll.start.lng !== undefined) {
            return (
              <Marker key={toll.start.id} position={[toll.start.lat, toll.start.lng]}  icon={tll}>
                <Popup>
                  <h1>{toll.start.name}</h1>
                  <b>Road: </b>{toll.start.road}<br />
                  <b>State:</b> {toll.start.state}<br />
                  <b>Tag Cost:</b> {toll.tagCost}<br />
                  <b>Cash Cost:</b> {toll.cashCost}
                </Popup>
              </Marker>
            );
          } else if (toll.lat !== undefined && toll.lng !== undefined) {
            return (
              <Marker key={toll.id} position={[toll.lat, toll.lng]} icon={tll}>
                <Popup>
                  <h2>{toll.name}</h2>
                  <b>Road: </b>{toll.road}<br />
                  <b>State:</b> {toll.state}<br />
                  <b>Tag Cost:</b> {toll.tagCost}<br />
                  <b>Cash Cost:</b> {toll.cashCost}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
        </MarkerClusterGroup>
        <MyComponent/>
    </MapContainer>
  )
}

export default Map;
