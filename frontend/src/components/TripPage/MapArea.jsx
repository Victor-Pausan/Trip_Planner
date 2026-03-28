import { Search, Layers, Bed, Navigation, Plus, Minus, Wand2 } from 'lucide-react';

export default function MapArea() {
  return (
    <div className="w-full h-full relative bg-[#aadaff]">
      {/* Map Iframe */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.226019342738!2d79.85871141477322!3d6.931944494991734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591146241a79%3A0x62959586141386!2sSri%20Lanka!5e0!3m2!1sen!2sus!4v1645454545454!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 z-0"
      ></iframe>

      {/* Floating Controls
      <div className="absolute top-4 left-4 z-10">
        <button className="bg-white rounded-full shadow-md px-4 py-2 flex items-center space-x-2 text-sm font-medium hover:bg-gray-50 transition-colors">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span>Export</span>
          <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Pro</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <Search size={20} />
        </button>
        <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <Layers size={20} />
        </button>
        <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <Bed size={20} />
        </button>
      </div>

      <div className="absolute bottom-8 right-4 z-10 flex flex-col space-y-4">
        <button className="w-12 h-12 bg-pink-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-pink-600 transition-colors">
          <Wand2 size={24} />
        </button>
        
        <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <Navigation size={18} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <Plus size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
            <Minus size={20} />
          </button>
        </div>
      </div>*/}
    </div> 
  );
}
