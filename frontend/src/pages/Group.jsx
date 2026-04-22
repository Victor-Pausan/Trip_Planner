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

function Group() {
    const { slug } = useParams();
    const { user } = useUser();

    const location = useLocation()
    const [group, setGroup] = useState("")
    const [members, setMembers] = useState([])

    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    const [userRole, setUserRole] = useState('')
    const [joinRequests, setJoinRequests] = useState([])

    const [trips, setTrips] = useState([])
    const placeholderImg = "https://placehold.co/600x400"

    const [groupTitle, setGroupTitle] = useState('');
    const [isEditingGroupTitle, setIsEditingGroupTitle] = useState(false);

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isAddTripOpen, setIsAddTripOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
    const [activeModal, setActiveModal] = useState('')

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteEmailError, setInviteEmailError] = useState('');
    const [inviteSending, setInviteSending] = useState(false);
    const [inviteSent, setInviteSent] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const handleSendInvite = async () => {
        setInviteSent(false);
        if (!inviteEmail) {
            setInviteEmailError('Please enter a valid email address.');
            return;
        }
        if (!isValidEmail(inviteEmail)) {
            setInviteEmailError('Please enter a valid email address.');
            return;
        }

        setInviteSending(true);
        try {
            await api.post(`/api/email/invite/`, {
                email: inviteEmail.trim(),
                group_slug: slug
            })
            setInviteEmail('');
            setInviteSent(true);
            setInviteEmailError('')
        } catch (err) {
            setInviteEmailError(err.message);
        } finally {
            setInviteSending(false);
        }
    }

    const handleCopy = (inviteLink) => {
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

        getGroup()
        getTrips()
        getUserRole(slug)
    }, [])

    useEffect(() => {
        if (!isEditingGroupTitle) setGroupTitle(group.title ?? '');
    }, [group.title]);

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

    const updateGroupTitle = async (newTitle) => {
        try {
            const res = await api.patch(
                `/api/groups/update/title/${group.id}/`,
                {
                    title: newTitle
                }
            )
        } catch (error) {
            alert(error)
        }
    }

    const getUserRole = async (slug) => {
        try {
            const res = await api.get(`/api/groups/token/user_role/${slug}/`)
            if (res.status === 200) {
                setUserRole(res.data[0].role);
                if (res.data[0].role == "admin")
                    await getJoinRequests(slug)
            }
        } catch (error) {
            alert(error)
        }
    }

    const getJoinRequests = async (slug) => {
        try {
            const res = await api.get(`/api/groups/token/process/${slug}/`)
            if (res.status === 200) {
                if (res.data.length != 0) {
                    const joinRequests = await Promise.all(
                        res.data.map(async (joinRequest) => {
                            const user = await getUser(joinRequest.user)
                            return { ...joinRequest, user: user }
                        })
                    )
                    setJoinRequests(joinRequests)
                }
            }
        } catch (error) {
            alert(error)
        }
    }

    const acceptJoinRequest = async (id) => {
        try {
            const res = await api.patch(`/api/groups/add/user/${id}/`)
            if (res.status === 200) {
                setJoinRequests(joinRequests.filter((req) => req.id != id))
                getGroupMembers()
            }
        } catch (error) {
            alert(error)
        }
    }

    const declineJoinRequest = async (id) => {
        try {
            const res = await api.delete(`/api/groups/delete/join_request/${id}/`)
            if (res.status === 204) {
                setJoinRequests(joinRequests.filter((req) => req.id != id))
            }
        } catch (error) {
            alert(error)
        }
    }

    return (
        <>
            <div className="min-h-screen">
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
                            {isEditingGroupTitle ? (
                                <input
                                    type="text"
                                    value={groupTitle}
                                    onChange={(e) => setGroupTitle(e.target.value)}
                                    onBlur={() => {
                                        setIsEditingGroupTitle(false);
                                        updateGroupTitle(groupTitle)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingGroupTitle(false);
                                            updateGroupTitle(groupTitle)
                                        }
                                    }}
                                    autoFocus
                                    className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                                />
                            ) : (
                                <h1
                                    className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2 cursor-pointer hover:bg-gray-100 rounded px-2 -ml-2 py-1 transition-colors"
                                    onClick={() => setIsEditingGroupTitle(true)}
                                >
                                    {groupTitle}
                                </h1>
                            )}
                            <p onClick={() => setIsMembersModalOpen(true)} className="text-gray-500 cursor-pointer hover:opacity-80 flex items-center gap-2">
                                <Users size={16} /> {members.length} Members
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <div onClick={() => setIsMembersModalOpen(true)} className="flex -space-x-3 cursor-pointer hover:opacity-80 px-2">
                                {members.map((member, i) => (
                                    i <= 3 ?
                                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm" title={member}>
                                            {member.username.charAt(0).toUpperCase()}
                                        </div> : ''
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
                                {userRole == 'admin' && (
                                    <button
                                        onClick={() => setActiveModal(trip.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
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
                                <p className="text-gray-500 text-sm mt-2">
                                    Share this link with friends to invite them to {group.title}.
                                </p>
                            </div>

                            {/* Copy link */}
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Invite link
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-1 flex items-center mb-6">
                                <input
                                    type="text"
                                    readOnly
                                    value={'http://' + window.location.host + `/group/join/${slug}`}
                                    className="bg-transparent border-none focus:ring-0 text-sm text-gray-600 w-full px-3 outline-none"
                                />
                                <button
                                    onClick={() => handleCopy('http://' + window.location.host + `/group/join/${slug}`)}
                                    className="bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    {copied
                                        ? <><Check size={16} className="text-green-500" /> Copied</>
                                        : <><Copy size={16} /> Copy</>
                                    }
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 mb-6" />

                            {/* Email invite */}
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Send via email
                            </p>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => {
                                            setInviteEmail(e.target.value);
                                            if (inviteEmailError) setInviteEmailError('');
                                        }}
                                        onBlur={() => {
                                            if (inviteEmail && !isValidEmail(inviteEmail)) {
                                                setInviteEmailError('Please enter a valid email address.');
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key == "Enter") {
                                                handleSendInvite()
                                            }
                                        }}
                                        placeholder="friend@example.com"
                                        className={`w-full text-sm px-4 py-2.5 rounded-xl border outline-none transition-colors ${inviteEmailError
                                            ? 'border-red-400 focus:border-red-400'
                                            : 'border-gray-200 focus:border-indigo-400'
                                            }`}
                                    />
                                    {inviteEmailError && (
                                        <p className="text-xs text-red-500 mt-1 ml-1">{inviteEmailError}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleSendInvite}
                                    disabled={inviteSending}
                                    className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Send size={15} />
                                    {inviteSending ? 'Sending…' : 'Send invitation'}
                                </button>
                                {inviteSent && (
                                    <p className="text-sm text-green-500 text-center">Invitation sent!</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <MembersModal
                    isOpen={isMembersModalOpen}
                    onClose={() => setIsMembersModalOpen(false)}
                    members={members}
                    handleMembersChange={setMembers}
                    requests={joinRequests}
                    groupSlug={slug}
                    currentUser={user}
                    currentUserRole={userRole}
                    onAcceptRequest={acceptJoinRequest}
                    onDeclineRequest={declineJoinRequest}
                />

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

            <DeleteModal
                isOpen={activeModal}
                onClose={() => setActiveModal('')}
                onConfirm={() => { deleteTrip(activeModal); setActiveModal('') }}
            />
            </div>
            <Footer />
        </>
    )
}

export default Group