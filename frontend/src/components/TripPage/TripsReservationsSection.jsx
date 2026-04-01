import React from 'react';
import { ReservationCard } from './ReservationCard.jsx';
import { Plane, Home, MapPin } from 'lucide-react';

export const TripReservationsSection = ({ reservations, currentUser, onDelete, onEdit }) => {
  const flights = reservations.filter(r => r.type === 'flight');
  const lodgings = reservations.filter(r => r.type === 'lodging');
  const activities = reservations.filter(r => r.type === 'activity');

  if (reservations.length === 0) return null;

  return (
    <div className="space-y-8 mt-8">
      {flights.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Plane size={16} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Flights</h3>
          </div>
          <div className="grid gap-4">
            {flights.map(res => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                currentUser={currentUser}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </section>
      )}

      {lodgings.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Home size={16} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Lodging</h3>
          </div>
          <div className="grid gap-4">
            {lodgings.map(res => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                currentUser={currentUser}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </section>
      )}

      {activities.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <MapPin size={16} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Activities</h3>
          </div>
          <div className="grid gap-4">
            {activities.map(res => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                currentUser={currentUser}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
