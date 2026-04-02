import React, { useState } from 'react';
import { Plane, Home, MapPin, Trash2, Edit2 } from 'lucide-react';
import { DeleteModal } from './Modals.jsx';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatJustDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ReservationCard = ({ reservation, currentUser, onDelete, onEdit }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isAuthor = reservation.author === currentUser.username;

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(reservation.id, reservation.type);
    setIsDeleteModalOpen(false);
  };

  const renderContent = () => {
    switch (reservation.type) {
      case 'flight':
        return (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Plane size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{reservation.airline}</h4>
                  <p className="text-sm text-gray-500">{reservation.flight_code}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{reservation.departure_airport} → {reservation.arrival_airport}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">Departs</span>
                  {formatDate(reservation.start_date)}
                </div>
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">Arrives</span>
                  {formatDate(reservation.end_date)}
                </div>
              </div>
              {reservation.notes && <p className="mt-2 text-sm text-gray-600 italic">"{reservation.notes}"</p>}
            </div>
          </div>
        );
      case 'lodging':
        return (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <Home size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">{reservation.place}</h4>
                {reservation.link && (
                  <a href={reservation.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    View booking
                  </a>
                )}
              </div>
              <div className="mt-3 flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">Check-in</span>
                  {formatJustDate(reservation.check_in)}
                </div>
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">Check-out</span>
                  {formatJustDate(reservation.check_out)}
                </div>
              </div>
              {reservation.notes && <p className="mt-2 text-sm text-gray-600 italic">"{reservation.notes}"</p>}
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{reservation.place}</h4>
              <div className="mt-3 flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider">Date & Time</span>
                  {formatDate(reservation.start_date)}
                  {reservation.end_date && ` - ${formatDate(reservation.end_date)}`}
                </div>
              </div>
              {reservation.notes && <p className="mt-2 text-sm text-gray-600 italic">"{reservation.notes}"</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
        {isAuthor && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100">
            <button onClick={() => onEdit(reservation)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
              <Edit2 size={16} />
            </button>
            <button onClick={handleDeleteClick} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        {renderContent()}
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
          <span>Added by {reservation.author}</span>
        </div>
      </div>
      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </>
  );
};
