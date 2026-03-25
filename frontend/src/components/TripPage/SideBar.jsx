import { Wand2, Compass, FileText, MapPin, ListTodo, Wallet, ChevronDown, LifeBuoy, ChevronsLeft } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full overflow-y-auto">
      <div className="p-4">
        <button className="w-full flex items-center justify-between bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg px-4 py-3 font-medium shadow-sm hover:opacity-90 transition-opacity">
          <div className="flex items-center space-x-2">
            <Wand2 size={18} />
            <span>AI Assistant</span>
          </div>
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs">
            â¨
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 bg-gray-900 text-white font-medium rounded-r-full mr-4">
            <ChevronDown size={16} className="text-gray-400" />
            <span>Overview</span>
          </button>
          
          <div className="pl-11 pr-4 space-y-1">
            <button className="w-full text-left py-1.5 text-sm text-gray-700 hover:text-gray-900 font-medium">Explore</button>
            <button className="w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-900">Notes</button>
            <button className="w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-900">Places to visit</button>
            <button className="w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-900">Untitled</button>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-r-full mr-4 transition-colors">
            <ChevronDown size={16} className="text-gray-400" />
            <span>Itinerary</span>
          </button>
          <div className="pl-11 pr-4">
            <button className="w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-900">Add trip dates</button>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-r-full mr-4 transition-colors">
            <ChevronDown size={16} className="text-gray-400" />
            <span>Budget</span>
          </button>
          <div className="pl-11 pr-4">
            <button className="w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-900">View</button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <button className="w-full flex items-center space-x-3 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <LifeBuoy size={18} />
          <span>Support</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronsLeft size={18} />
          <span>Hide sidebar</span>
        </button>
      </div>
    </div>
  );
}
