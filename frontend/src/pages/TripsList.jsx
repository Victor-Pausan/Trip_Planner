import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import TripForm from "../components/TripForm";
import { Link } from 'react-router-dom';
import { Users, Send, UserPlus, Calendar, Trash2, ArrowLeft, Plus, Copy, Check } from 'lucide-react';
import MembersModal from "../components/TripPage/MembersModal";
import { useUser } from "../contexts/UserContext";
import Footer from "../components/Footer.jsx";

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (isOpen === '') return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip</h3>
                    <p className="text-gray-600 text-sm">Are you sure you want to delete this trip? This action cannot be undone.</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};

function TripsList() {
    const { slug } = useParams();
    const { user } = useUser();

    const location = useLocation()

    const [message, setMessage] = useState("")
    const navigate = useNavigate()
    
    const [groups, setGroups] = useState([])
    
    const [userRole, setUserRole] = useState('')

    const [trips, setTrips] = useState([])
    const placeholderImg = "https://placehold.co/600x400"

    const [isAddTripOpen, setIsAddTripOpen] = useState(false);
    const [activeModal, setActiveModal] = useState('')

    const accessTrip = (trip_id) => {
        let path = `/trip/${trip_id}`
        navigate(path)
    }

    useEffect(() => {
        setMessage(location.state)
        window.history.replaceState({}, document.title)

        getAllTrips()
        fetchGroups();
    }, [])

    const getAllTrips = async () => {
        try {
            const res = await api.get(`/api/trips/user/`)
            if (res.status === 200) {
                const tripsWithImages = await Promise.all(
                    res.data.map(async (trip) => {
                        const image = await getPlaceData(trip.place)
                        return { ...trip, image }
                    })
                )
                setTrips(tripsWithImages)
            } else {
                alert("Trip fetch didn't work.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const fetchGroups = async () => {
        try {
            const res = await api.get("/api/groups/");
            const groupsWithRoles = await Promise.all(
                res.data.map(async (group) => ({
                    ...group,
                    userRole: await getUserRole(group.slug),
                }))
            );
    
            const filteredGroups = groupsWithRoles.filter(
                ({ userRole }) => userRole === "admin" || userRole === "organiser"
            );
            setGroups(filteredGroups);
        } catch (error) {
            alert(error);
        }
    };

    const getUserRole = async (slug) => {
        try {
            const res = await api.get(`/api/groups/token/user_role/${slug}/`)
            if (res.status === 200) {
                return res.data[0].role;
            }
        } catch (error) {
            alert(error)
        }
    }

    const deleteTrip = async (id) => {
        try {
            const res = await api.delete(`/api/trip/delete/${id}/`)
            if (res.status === 204) {
                setTrips(trips.filter((trip) => trip.id != id))
                setMessage("Group deleted succesfully!")
            } else {
                setMessage("Failed to delete group.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const getPlaceData = async (placeId) => {
        try {
            const res = await api.get(`/api/place/${placeId}/`)
            if (res.status === 200) {
                const apiPhotoUri = res.data.photoURI
                if (apiPhotoUri) {
                    return (apiPhotoUri)
                } else {
                    return (placeholderImg)
                }
            } else {
                return placeholderImg
            }
        } catch (error) {
            console.log("Error fetching" + error)
            return placeholderImg
        }
    }

    return (
        <>
            <div className="min-h-screen">
                <Navbar />
                <div className="max-w-6xl mx-auto px-6 py-8">

                    {/* Group Header */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-sky-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1
                                    className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2 cursor-pointer hover:bg-gray-100 rounded px-2 -ml-2 py-1 transition-colors">
                                    My Trips
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Trips Section */}
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Planned Trips</h2>
                            <p className="text-gray-500 text-sm mt-1">All of your planned adventures</p>
                        </div>
                        <button
                            onClick={() => setIsAddTripOpen(true)}
                            className="bg-gradient-to-br from-green-400 to-sky-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                        >
                            <Plus size={18} /> Add Trip
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.length == 0 && (
                            <span className="col-start-2 row-start-5 text-lg text-gray-500 mt-1">No trips available yet :(  Hit the Add Trip button and start planning your next adventure!</span>
                        )}

                        {trips.map((trip) => (
                            <div key={trip.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-xl font-bold text-white mb-1">{trip.title}</h3>
                                        <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                                            <Calendar size={12} /> {trip?.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-white">
                                    <button
                                        onClick={() => accessTrip(trip.id)}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                                        View Details
                                    </button>
                                    {/* {userRole == 'admin' && (
                                        <button
                                            onClick={() => setActiveModal(trip.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Trip Modal */}
                    {isAddTripOpen && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <div className="relative w-full max-w-lg my-8">
                                <button
                                    onClick={() => setIsAddTripOpen(false)}
                                    className="absolute -top-10 right-0 text-white hover:text-gray-200 p-2 z-10 font-medium"
                                >
                                    ✕ Close
                                </button>
                                <TripForm onClose={() => setIsAddTripOpen(false)} groups={groups} />
                            </div>
                        </div>
                    )}
                </div>

                {/* <DeleteModal
                    isOpen={activeModal}
                    onClose={() => setActiveModal('')}
                    onConfirm={() => { deleteTrip(activeModal); setActiveModal('') }}
                /> */}
            </div>
            <Footer />
        </>
    )
}

export default TripsList