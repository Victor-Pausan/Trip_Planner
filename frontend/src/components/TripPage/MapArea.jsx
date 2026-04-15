import { Search, Layers, Bed, Navigation, Plus, Minus, Wand2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useAdvancedMarkerRef, InfoWindow, MapControl, ControlPosition } from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react';


export default function MapArea({ mainLocation, reservations }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [locations, setLocations] = useState([])

  useEffect(() => {
    const locationsArray = []
    if (reservations) {
      reservations.forEach((r) => {
        if (r.latitude && r.longitude) {
          locationsArray.push({ key: r.place, address:r.address, photoURI:r.photoURI, placeName:r.placeName, location: { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) } })
        }
      });
      setLocations(locationsArray)
    }
  }, [reservations])

  const PoiMarkers = ({ point }) => {
    const [infoWindowShown, setInfoWindowShown] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const handleMarkerClick = () => setInfoWindowShown(isShown => !isShown)

    const handleClose = () => setInfoWindowShown(false)
    return (
      <>
        <AdvancedMarker
          key={point.key}
          ref={markerRef}
          position={point.location}
          clickable={true}
          onClick={handleMarkerClick}
        >
          <Pin background={'#FF0004'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
        {infoWindowShown && (
          <InfoWindow anchor={marker} onClose={handleClose}>
            <div class="bg-neutral-primary-soft block max-h-96 max-w-sm p-6 border border-default rounded-base shadow-xs">
                <img class="max-h-48 rounded-base" src={point.photoURI} alt="" />
              <a href="#">
                <h5 class="mt-6 mb-2 text-2xl font-semibold tracking-tight text-heading">{point.placeName}</h5>
              </a>
              {point.address && (
                <span>Address: {point?.address}</span>
              )}
            </div>
          </InfoWindow>
        )}
      </>
    )
  }

  return (
    <div className="w-full h-full relative bg-[#aadaff]">

      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%', border: 0 }}
          defaultZoom={12}
          defaultCenter={mainLocation}
          gestureHandling='greedy'
          mapId='DEMO_MAP_ID'
          disableDefaultUI
        >
          {locations.map((point) => (
            <PoiMarkers point={point} />
          ))}
          
        </Map>
      </APIProvider>

    </div>
  );
}
