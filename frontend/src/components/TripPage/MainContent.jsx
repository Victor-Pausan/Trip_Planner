import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Send, Check, Plane, Paperclip, Calendar, Plus, Home, MapPin, Trash2, UserPlus } from 'lucide-react';
import { useUser } from '../../contexts/UserContext'
import { TripReservationsSection } from './TripsReservationsSection';
import { FlightModal, LodgingModal, ActivityModal, DeleteModal, DatesModal } from './Modals';
import MembersModal from './MembersModal'
import { Link } from 'react-router-dom';
import api from '../../api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function MainContent({
  photoURI, trip, posts, addPost, deletePost,
  handleAppreciate, isPhotoLoading, onTitleSave,
  reservations, addReservation, editReservation,
  deleteReservation, joinRequests, members,
  currentUserRole, onAcceptRequest, onDeclineRequest,
  editTripDates, changeMapCenter, handleMembersChange }) {
  const [title, setTitle] = useState('');
  const [postDescription, setPostDescription] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copied, setCopied] = useState(false)
  const [postToDelete, setPostToDelete] = useState('')

  const { user: currentUser } = useUser()

  const [activeModal, setActiveModal] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [currentEditingReservation, setCurrentEditingReservation] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isAuthorized = currentUserRole == "admin" || currentUserRole == "organiser"

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
        group_slug: trip.group
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

  const [isTripDates, setIsTripDates] = useState(false)

  useEffect(() => {
    if (!isEditingTitle) setTitle(trip?.title ?? '');
  }, [trip?.title]);

  useEffect(() => {
    setIsTripDates(trip?.start_date && trip?.end_date)
  }, [trip?.start_date, trip?.end_date])

  const handleAddPost = () => {
    if (postTitle.trim() && postDescription.trim()) {
      addPost({
        title: postTitle,
        description: postDescription
      })
      setPostTitle('')
      setPostDescription('')
    }
  };

  const handleDeletePost = (id) => {
    deletePost(id)
    closeModal()
    setPostToDelete('')
  }

  const handleSaveReservation = (type, data) => {
    if (currentEditingReservation) {
      editReservation(currentEditingReservation, data)
    }
    else {
      addReservation(type, data)
    }
    closeModal();
  };

  const handleEditReservation = (reservation) => {
    setCurrentEditingReservation(reservation);
    setActiveModal(reservation.type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setCurrentEditingReservation(null);
  };

  const handleCopy = (inviteLink) => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDates = (type, data) => {
    editTripDates(data)
    closeModal()
  }

  const handleReservationClick = (type, sectionId) => {
    if (isAuthorized) {
      setActiveModal(type);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 relative pb-20">
      {/* Hero Section */}
      <div className="relative h-64 w-full overflow-hidden">
        {isPhotoLoading ? (
          // Tailwind skeleton shimmer
          <div className="w-full h-full bg-gray-200 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        ) : photoURI ? (
          <img
            src={photoURI}
            alt="Place Picture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          // Fallback when no photo is available
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">No photo available</span>
          </div>
        )}
      </div>

      {/* Floating Title Card */}
      <div className="max-w-3xl mx-auto px-6 -mt-24 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false)
                  onTitleSave?.(title);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    onTitleSave?.(title);
                  }
                }}
                autoFocus
                className="text-4xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full bg-transparent"
              />
            ) : (
              <h1
                className="text-4xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 -ml-2 py-1 transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h1>
            )}
            <Link to={`/group/${trip.group}`} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors">
              <ArrowLeft size={16} /> Group Page
            </Link>
          </div>

          <div className="flex items-center justify-between mt-8">
            <div>
              {isAuthorized && (
                <button onClick={() => setActiveModal('dates')} className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium">
                  <Calendar size={16} />
                  <span>{isTripDates ? 'Edit' : 'Add'} trip dates</span>
                </button>
              )}
              {isTripDates && (
                <div className="mt-3 flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Start Day</span>
                    {formatDate(trip.start_date)}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">End Day</span>
                    {formatDate(trip.end_date)}
                  </div>
                </div>
              )}

            </div>
            <div className="flex items-center space-x-2">
              <div
                className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsMembersModalOpen(true)}
              >
                {members.map((member, i) => (
                  i <= 3 ?
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm" title={member}>
                      {member.username.charAt(0).toUpperCase()}
                    </div> : ''
                ))}
              </div>
              <button onClick={() => setIsInviteOpen(true)} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12 space-y-12">

        {/* Reservations Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className='flex flex-row justify-between'>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reservations and attachments</h2>
            {isAuthorized ?
              (<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>) : (
                <h2 className="text-lg font-bold text-gray-900 mb-4">View Details</h2>
              )}

          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <button title={isAuthorized ? "Add New" : "View Details"} onClick={() => { handleReservationClick('flight', 'flights') }} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group" >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <Plane size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Flight</span>
            </button>
            <button title={isAuthorized ? "Add New" : "View Details"} onClick={() => handleReservationClick('lodging', 'lodgings')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                <Home size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Lodging</span>
            </button>
            <button title={isAuthorized ? "Add New" : "View Details"} onClick={() => handleReservationClick('activity', 'activities')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Activity</span>
            </button>
            <a title='View Details' href='#notes' className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mb-2 group-hover:scale-110 transition-transform">
                <Paperclip size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Attachment</span>
            </a>
          </div>
        </div>

        {/* Flight, Lodging and Activities reservations Section */}
        <TripReservationsSection
          reservations={reservations}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onDelete={deleteReservation}
          onEdit={handleEditReservation}
          changeMapCenter={changeMapCenter}
        />

        {/* Posts Section */}

        <div className="mt-12" id='notes'>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notes & Ideas</h2>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[30px] border-b mb-3"
            />
            <textarea
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              placeholder="Jot down an idea, place to visit, or note..."
              className="w-full resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[100px]"
            />

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
              <div className="flex space-x-2 text-gray-400">
                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Paperclip size={18} /></button>
              </div>
              <button
                onClick={handleAddPost}
                disabled={!postDescription.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Post
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{post.author}</h3>
                      <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {((currentUser && post.author == currentUser.username) || currentUserRole == 'admin') && (
                    <button
                      onClick={() => { setActiveModal('post'); setPostToDelete(post.id) }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h4>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.description}</p>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center">
                  <button
                    onClick={() => handleAppreciate(post.id, post.hasAppreciated ? 'unlike' : 'like')}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors ${post.hasAppreciated ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={post.hasAppreciated ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                    <span>{post.likes_count} {post.likes_count === 1 ? 'Appreciation' : 'Appreciations'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      <FlightModal
        isOpen={activeModal === 'flight'}
        onClose={closeModal}
        onSave={(data) => handleSaveReservation('flight', data)}
        initialData={currentEditingReservation?.type === 'flight' ? currentEditingReservation : null}
      />
      <LodgingModal
        isOpen={activeModal === 'lodging'}
        onClose={closeModal}
        onSave={(data) => handleSaveReservation('lodging', data)}
        initialData={currentEditingReservation?.type === 'lodging' ? currentEditingReservation : null}
      />
      <ActivityModal
        isOpen={activeModal === 'activity'}
        onClose={closeModal}
        onSave={(data) => handleSaveReservation('activity', data)}
        initialData={currentEditingReservation?.type === 'activity' ? currentEditingReservation : null}
      />

      <DatesModal
        isOpen={activeModal === 'dates'}
        onClose={closeModal}
        onSave={(data) => handleSaveDates('dates', data)}
        initialData={trip?.start_date != '' && trip?.end_date != '' ? { start_date: trip?.start_date, end_date: trip?.end_date } : null}
      />

      <DeleteModal
        isOpen={activeModal === 'post'}
        onClose={closeModal}
        onConfirm={() => { handleDeletePost(postToDelete) }}
      />

      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        handleMembersChange={handleMembersChange}
        requests={joinRequests}
        groupSlug={trip.group}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
        onAcceptRequest={onAcceptRequest}
        onDeclineRequest={onDeclineRequest}
      />

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
                Share this link with friends to invite them to {trip.title}.
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
                value={'http://' + window.location.host + `/group/join/${trip.group}`}
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-600 w-full px-3 outline-none"
              />
              <button
                onClick={() => handleCopy('http://' + window.location.host + `/group/join/${trip.group}`)}
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
    </div>
  );
}
