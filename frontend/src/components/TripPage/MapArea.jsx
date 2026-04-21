import { Search, Layers, Bed, Navigation, Plus, Minus, Wand2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useAdvancedMarkerRef, InfoWindow, MapControl, ControlPosition } from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react';
import api from '../../api';
import { useUser } from '../../contexts/UserContext';
import { useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const PlaceInfoWindow = ({ selectedPlace, onClose, addToGlobalReservations, tripId, userRole }) => {
  const [confirmed, setConfirmed] = useState(false)
  const [showChoice, setShowChoice] = useState(false)

  const isAuthorized = userRole == "admin" || userRole == "organiser"

  const { user } = useUser()

  const TripTypeOption = ({ emoji, bgColor, label, sublabel, onClick }) => {
    return (
      <button
        onClick={onClick}
        className="w-full px-4 py-3 text-left border-t border-gray-100 bg-white hover:bg-gray-50 transition-colors flex items-center gap-3"
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: bgColor }}
        >
          {emoji}
        </span>
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">{sublabel}</div>
        </div>
      </button>
    );
  }

  const handleAddToTrip = () => {
    if (showChoice) {
      setShowChoice(false)
    } else {
      setShowChoice(true)
    }
  }

  const handleSelectType = async (type, selectedPlace) => {
    try {
      const res = await api.post(`/api/${type}/${tripId}/`, {
        locationID: selectedPlace.id,
        locationName: selectedPlace.name
      })
      if (res.status === 201) {
        res.data.author = user.username

        const newReservation = {
          ...res.data,
          latitude: selectedPlace.location.lat,
          longitude: selectedPlace.location.lng,
          placeName: selectedPlace.name,
          photoURI: selectedPlace.photoURI,
          address: selectedPlace.address,
          rating: selectedPlace.rating,
          websiteUri: selectedPlace.websiteUri,
          type
        };
        setConfirmed(type)
        addToGlobalReservations(newReservation)
      }

    } catch (error) {
      alert(error)
    }
  }

  return (
    <>
      {/* Sliding panel */}
      <div
        className="absolute bottom-0 left-0 min-h-72 right-0 bg-white rounded-t-2xl overflow-hidden z-10"
        style={{
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          transform: selectedPlace ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-4 pb-1">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main info row */}
        <div className="flex gap-3.5 px-4 pb-4">
          {/* Image placeholder */}
          <div className="w-22 h-22 rounded-xl bg-blue-50 flex-shrink-0 flex items-center justify-center text-4xl"
            style={{ width: 88, height: 88 }}>
            {selectedPlace.photoURI ?
              <img src={selectedPlace.photoURI} alt='' />
              : '🌄'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl font-medium text-gray-900 truncate">
                  {selectedPlace.name}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 text-base font-medium text-gray-800">
                ⭐ {parseFloat(selectedPlace.rating)}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-1 mb-1.5">
              <span className="text-xs mt-0.5">📍</span>
              <p className="text-base text-gray-500 leading-snug">{selectedPlace.address}</p>

            </div>

            {selectedPlace.websiteUri && (
              <a href={selectedPlace.websiteUri} target="_blank" class="inline-flex font-medium items-center text-fg-brand hover:underline">
                Visit Website
                <svg class="w-4 h-4 ms-2 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" /></svg>
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-500 leading-relaxed">
            {selectedPlace.description}
          </p>
        </div>

        {/* Add to trip section */}
        {isAuthorized && (
          <>
            <div className='h-16'></div>
            <div className="px-4 pb-5">
              {!confirmed ? (
                <>

                  <button
                    onClick={handleAddToTrip}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium rounded-xl transition-colors"
                  >
                    + Add to trip
                  </button>

                  {/* Type choice */}
                  {showChoice && (
                    <div className="mt-2.5 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 text-xs text-gray-500 bg-gray-50">
                        Add as…
                      </div>
                      <TripTypeOption
                        emoji="🎯"
                        bgColor="#EEF2FF"
                        label="Activity"
                        sublabel="Things to do, attractions, dining"
                        onClick={() => handleSelectType("activity", selectedPlace)}
                      />
                      <TripTypeOption
                        emoji="🏨"
                        bgColor="#FEF3C7"
                        label="Lodging"
                        sublabel="Hotels, rentals, places to stay"
                        onClick={() => handleSelectType("lodging", selectedPlace)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-base">✅</span>
                  <span className="text-sm font-medium text-emerald-800">
                    "{selectedPlace.name}" added as {confirmed}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </>

  )
}

const MapController = ({ mainLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !mainLocation) return;

    map.panTo(mainLocation);
  }, [map, mainLocation]);

  return null;
};

export default function MapArea({ mainLocation, reservations, addReservation, tripId, userRole, suggestions }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [locations, setLocations] = useState([])

  const mapRef = useRef(null);

  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    const locationsArray = []
    if (reservations) {
      reservations.forEach((r) => {
        if (r.latitude && r.longitude) {
          locationsArray.push({ key: r.place, rating: r.rating, websiteUri: r.websiteUri, address: r.address, photoURI: r.photoURI, placeName: r.placeName, location: { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) } })
        }
      });
      setLocations(locationsArray)
    }
  }, [reservations])

  const closePanel = () => {
    setSelectedPlace(null)
  }

  const getPlaceData = async (place_id) => {
    try {
      const res = await api.get(`/api/place/${place_id}/`)
      if (res.status === 200) {
        const name = res.data.name
        const apiPhotoUri = res.data.photoURI
        const latitude = parseFloat(res.data.latitude)
        const longitude = parseFloat(res.data.longitude)
        const address = res.data.address
        const rating = res.data.rating
        const websiteUri = res.data.websiteUri
        const description = res.data.description

        setSelectedPlace({
          id: place_id,
          name: name,
          photoURI: apiPhotoUri,
          address: address,
          location: { lat: latitude, lng: longitude },
          rating: rating,
          websiteUri: websiteUri,
          description: description
        })
      }
    } catch (error) {
      console.log("Error fetching" + error);
    }
  }

  const onMapClick = (e) => {
    if (e.detail.placeId) {
      e.stop()
      getPlaceData(e.detail.placeId)
    }
  }

  const PoiMarkers = ({ point, color, key }) => {
    const [infoWindowShown, setInfoWindowShown] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const handleMarkerClick = () => setInfoWindowShown(isShown => !isShown)

    const handleClose = () => setInfoWindowShown(false)
    return (
      <>
        <AdvancedMarker
          key={key}
          ref={markerRef}
          position={point.location}
          clickable={true}
          onClick={handleMarkerClick}
        >
          <Pin background={color} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
        {infoWindowShown && (
          <InfoWindow anchor={marker} onClose={handleClose}>
            <div class="flex flex-col bg-neutral-primary-soft min-h-60 min-w-60 p-6 ">
              <div className="flex gap-3.5 px-4 pb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xl font-medium text-gray-900 truncate">
                        {point.placeName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 text-base font-medium text-gray-800">
                      ⭐ {parseFloat(point.rating)}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-1 mb-1.5">
                    <span className="text-xs mt-0.5">📍</span>
                    <p className="text-base text-gray-500 leading-snug">{point.address}</p>

                  </div>

                  {point.websiteUri && (
                    <a href={point.websiteUri} target="_blank" class="inline-flex font-medium items-center text-fg-brand hover:underline">
                      Visit Website
                      <svg class="w-4 h-4 ms-2 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778" /></svg>
                    </a>
                  )}
                </div>
              </div>
              <div className="m-auto flex-shrink-0 flex items-center justify-center text-4xl"
              >
                {point.photoURI ?
                  <img src={point.photoURI} className='max-w-30 max-h-30' alt='' />
                  : '🌄'}
              </div>
            </div>
          </InfoWindow >
        )
        }
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
          onClick={onMapClick}
          onLoad={(map) => (mapRef.current = map)}
        >
          <MapController mainLocation={mainLocation} />
          {locations.map((point) => (
            <PoiMarkers
              key={`reservation-${point.key ?? point.place ?? point.id ?? `${point.location?.lat}-${point.location?.lng}`}`}
              point={point}
              color={'#FF0004'}
            />
          ))}
          
          {suggestions.map((point) => (
            <PoiMarkers
              key={`suggestion-${point.id ?? point.place ?? `${point.location?.lat}-${point.location?.lng}`}`}
              point={point}
              color={'#b0c999'}
            />
          ))}

          {selectedPlace && (
            <PlaceInfoWindow
              selectedPlace={selectedPlace}
              onClose={closePanel}
              addToGlobalReservations={addReservation}
              tripId={tripId}
              userRole={userRole}
            />
          )}

        </Map>
      </APIProvider>

    </div>
  );
}
