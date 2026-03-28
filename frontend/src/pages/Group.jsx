import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import TripForm from "../components/TripForm";
import { Link } from 'react-router-dom';
import { Users, UserPlus, Calendar, Trash2, ArrowLeft, Plus, Copy, Check } from 'lucide-react';

function Group() {
    const { slug } = useParams();

    const location = useLocation()
    const [group, setGroup] = useState("")
    const [members, setMembers] = useState([])

    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    const [trips, setTrips] = useState([])
    const placeholderImg = "https://placehold.co/600x400"

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isAddTripOpen, setIsAddTripOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const accessTrip = (trip_id) => {
        let path = `/trip/${trip_id}`
        navigate(path)
    }

    useEffect(() => {
        setMessage(location.state)
        window.history.replaceState({}, document.title)

        console.log(location.state);

        getGroup()
        getTrips()
    }, [])


    const getGroup = async () => {
        try {
            const res = await api.get(`/api/groups/${slug}/`)
            if (res.status === 200) {
                setGroup(res.data)
            } else {
                alert("Group not found.")
            }
        } catch (error) {
            alert(error)
        }
        getGroupMembers()
    }

    const getTrips = async () => {
        try {
            const res = await api.get(`/api/trips/${slug}/`)
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

    const getGroupMembers = async () => {
        try {
            const res = await api.get(`/api/groups/members/${slug}/`)
            if (res.status === 200) {
                setMembers(res.data)
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
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Link to="/group" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Groups
                </Link>

                {/* Group Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-sky-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">{group.title}</h1>
                            <p className="text-gray-500 flex items-center gap-2">
                                <Users size={16} /> {members.length} Members
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <div className="flex -space-x-3 px-2">
                                {members.map((member, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm" title={member}>
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsInviteOpen(true)}
                                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                                title="Add Member"
                            >
                                <UserPlus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trips Section */}
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Planned Trips</h2>
                        <p className="text-gray-500 text-sm mt-1">All adventures for this group</p>
                    </div>
                    <button
                        onClick={() => setIsAddTripOpen(true)}
                        className="bg-gradient-to-br from-green-400 to-sky-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={18} /> Add Trip
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div key={trip.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white mb-1">{trip.title}</h3>
                                    <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                                        <Calendar size={12} /> {trip.start_date}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 flex justify-between items-center bg-white">
                                <button
                                    onClick={() => accessTrip(trip.id)}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
                                    View Details
                                </button>
                                <button
                                    onClick={() => deleteTrip(trip.id)}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invite Modal */}
                {isInviteOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                            >
                                ✕
                            </button>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                    <UserPlus size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Invite Members</h2>
                                <p className="text-gray-500 text-sm mt-2">Share this link with friends to invite them to {group.title}.</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-1 flex items-center">
                                <input
                                    type="text"
                                    readOnly
                                    value={'http://' + window.location.host + `/group/join/${group.slug}`}
                                    className="bg-transparent border-none focus:ring-0 text-sm text-gray-600 w-full px-3 outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    {copied ? <><Check size={16} className="text-green-500" /> Copied</> : <><Copy size={16} /> Copy</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                            <TripForm onClose={() => setIsAddTripOpen(false)} group_id={group.id} />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Group