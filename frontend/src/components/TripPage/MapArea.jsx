import { Search, Layers, Bed, Navigation, Plus, Minus, Wand2 } from 'lucide-react';
import { APIProvider, Map } from '@vis.gl/react-google-maps' 

export default function MapArea({ location }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <div className="w-full h-full relative bg-[#aadaff]">

      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%', border: 0 }}
          defaultZoom={12}
          defaultCenter={ location }
          gestureHandling='greedy'
          disableDefaultUI
        />
      </APIProvider>

    </div>
  );
}
