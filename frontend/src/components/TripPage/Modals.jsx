import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export const FlightModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        airline: '', flight_code: '', departure_airport: '', arrival_airport: '', start_date: '', end_date: '', notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) setFormData(initialData);
            else setFormData({ airline: '', flight_code: '', departure_airport: '', arrival_airport: '', start_date: '', end_date: '', notes: '' });
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Flight" : "Add Flight"} onSave={handleSave}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.airline} onChange={e => setFormData({ ...formData, airline: e.target.value })} placeholder="e.g. Wizz Air" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.flight_code} onChange={e => setFormData({ ...formData, flight_code: e.target.value })} placeholder="e.g. W6 3301" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport</label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" value={formData.departure_airport} onChange={e => setFormData({ ...formData, departure_airport: e.target.value.toUpperCase() })} placeholder="OTP" maxLength={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport</label>
                        <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" value={formData.arrival_airport} onChange={e => setFormData({ ...formData, arrival_airport: e.target.value.toUpperCase() })} placeholder="BCN" maxLength={3} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                        <input type="datetime-local" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                        <input type="datetime-local" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
            </div>
        </Modal>
    );
};

export const LodgingModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        place: '', link: '', check_in: '', check_out: '', notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) setFormData(initialData);
            else setFormData({ place: '', link: '', check_in: '', check_out: '', notes: '' });
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Lodging" : "Add Lodging"} onSave={handleSave}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="e.g. Hotel Barcelona Center" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Link</label>
                    <input type="url" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.link || ''} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.check_in} onChange={e => setFormData({ ...formData, check_in: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.check_out} onChange={e => setFormData({ ...formData, check_out: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
            </div>
        </Modal>
    );
};

export const ActivityModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        place: '', start_date: '', end_date: '', notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) setFormData(initialData);
            else setFormData({ place: '', start_date: '', end_date: '', notes: '' });
        }
    }, [initialData, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Activity" : "Add Activity"} onSave={handleSave}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name / Place</label>
                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="e.g. Sagrada Familia" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input type="datetime-local" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Optional)</label>
                        <input type="datetime-local" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={formData.end_date || ''} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
            </div>
        </Modal>
    );
};

export const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Reservation</h3>
                    <p className="text-gray-600 text-sm">Are you sure you want to delete this reservation? This action cannot be undone.</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};
