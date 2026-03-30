import { useState } from 'react';
import { Plane, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import GooglePlacesAutosugest from "../components/PlacesAPI/GooglePlacesAutosugest";

export default function TripForm({ onClose, group_id, groups }) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        locationName: '',
        locationID: '',
        startDate: '',
        endDate: '',
        groupType: ''
    });
    const [apiLoading, setApiLoading] = useState(false);
    const [formReqLoading, setFormReqLoading] = useState(false);

    const redirectToTrip = (id) => {
        navigate(`/trip/${id}`)
    }

    const addTrip = async (e) => {
        e.preventDefault()

        if(formData.locationName && formData.locationID){
            setFormReqLoading(true);

            try {
                const res = await api.post(`/api/trip/create/`,
                    {
                        locationName: formData.locationName,
                        locationID: formData.locationID,
                        start_date: formData.startDate,
                        end_date: formData.endDate,
                        group: group_id ? group_id : formData.groupType 
                    });
                if (res.status === 201) {
                    redirectToTrip(res.data.id)
                } else {
                    alert("Failed to add trip.")
                }
            } catch (error) {
                alert(error)
            }
        } 
    }

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-50 relative">
            {/* CARD COMPONENT */}
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-50 relative">

                {/* Decorative Header Background */}
                <div className="h-44 w-full absolute top-0 left-0 z-0">
                    <div className="opacity-100 absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                {/* CONTENT WRAPPER */}
                <div className="relative z-10 px-8 pb-10 pt-8">

                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4  bg-gradient-to-br from-green-400 to-sky-400">
                            <Plane size={32} strokeWidth={2} className="transform -rotate-45" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Plan Your Escape</h1>
                        <p className="text-gray-500 text-sm mt-1">Where will your next adventure take you?</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={addTrip} className="space-y-6">

                        {/* LOCATION SELECT */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={14} /> Destination
                            </label>
                            <div className="relative">
                                <GooglePlacesAutosugest
                                    value={formData.locationName}
                                    onChange={(locationName, locationID) => { setFormData({ ...formData, locationName: locationName, locationID: locationID }) }}
                                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                />
                            </div>
                        </div>

                        {/* DATES GRID */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar size={14} /> Depart <span className="lowercase" >(optional)</span>
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={(e) => { setFormData({ ...formData, startDate: e.target.value }); setFormReqLoading(false) }}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-4 transition duration-200"
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar size={14} /> Return <span className="lowercase" >(optional)</span>
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-4 transition duration-200"
                                />
                            </div>
                        </div>

                        {/* GROUP SELECT */}
                        {group_id == undefined ? 
                        (<div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Users size={14} /> Who are you traveling with?
                            </label>
                            <div className="relative">
                                <select
                                    name="groupType"
                                    value={formData.groupType}
                                    onChange={(e) => { setFormData({ ...formData, groupType: e.target.value }); setApiLoading(false); setFormReqLoading(false) }}
                                    disabled={apiLoading}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-4 appearance-none transition duration-200 disabled:opacity-50"
                                    required
                                >
                                    <option disabled>Who are you traveling with?</option>
                                    <option value="">Solo/New Group</option>
                                    {groups.map((grp) => (
                                        <option key={grp.id} value={grp.id}>{grp.title}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    {apiLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>) : '' }
                        

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={formReqLoading || !(formData.locationID && formData.locationName)}
                            className={`w-full bg-gradient-to-br text-white from-green-400 to-sky-400  font-bold py-4 px-4 rounded-xl shadow-lg transition-all duration-200 mt-4 flex items-center justify-center gap-2
                                ${formReqLoading || !(formData.locationID && formData.locationName)
                                  ? 'cursor-not-allowed opacity-60'
                                  : 'hover:shadow-xl hover:-translate-y-0.5 transform cursor-pointer'
                            }`}>
                            Start Planning <Plane size={18} />
                            {formReqLoading ? <Loader2 size={18} className="animate-spin" /> : ''}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
