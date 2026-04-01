import { useEffect, useState } from 'react';
import { Heart, ChevronDown, Search, ChevronRight, Plane, Bed, Car, Utensils, Paperclip, MoreHorizontal, Calendar, Users, Pencil, Plus, MessageSquare, Home, MapPin, Trash2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext'
import { TripReservationsSection } from './TripsReservationsSection';
import { FlightModal, LodgingModal, ActivityModal } from './Modals';

function formatMonthDayYear(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  const month = parts.find(p => p.type === 'month')?.value ?? '';
  const day = parts.find(p => p.type === 'day')?.value ?? '';
  const year = parts.find(p => p.type === 'year')?.value ?? '';
  return `${month} - ${day} - ${year}`;
}

export default function MainContent({ photoURI, trip, posts, addPost, deletePost, handleAppreciate, isPhotoLoading, onTitleSave, reservations, addReservation, editReservation, deleteReservation }) {
  const [title, setTitle] = useState('');
  const [postDescription, setPostDescription] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { user: currentUser } = useUser()

  const [activeModal, setActiveModal] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);

  useEffect(() => {
    if (!isEditingTitle) setTitle(trip?.title ?? '');
  }, [trip?.title]);

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

  const handleSaveReservation = (type, data) => {
    if (editingReservation) {
      editReservation(editReservation, data)
    }
    //  else {
    //   const newReservation = {
    //     ...data,
    //     type,
    //     author: currentUser
    //   };
    //   setReservations([...reservations, newReservation]);
    // }
    closeModal();
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setActiveModal(reservation.type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingReservation(null);
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
          </div>

          <div className="flex items-center justify-between mt-8">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium">
              <Calendar size={16} />
              <span>Add trip dates</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <img src="https://picsum.photos/seed/user1/32/32" alt="User" className="w-8 h-8 rounded-full border-2 border-white" referrerPolicy="no-referrer" />
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12 space-y-12">

        {/* Reservations Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reservations and attachments</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <button onClick={() => setActiveModal('flight')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <Plane size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Flight</span>
            </button>
            <button onClick={() => setActiveModal('lodging')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                <Home size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Lodging</span>
            </button>
            <button onClick={() => setActiveModal('activity')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Activity</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mb-2 group-hover:scale-110 transition-transform">
                <Paperclip size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600">Attachment</span>
            </button>
          </div>
        </div>

        {/* Flight, Lodging and Activities reservations Section */}
        <TripReservationsSection
          reservations={reservations}
          currentUser={currentUser}
          onDelete={deleteReservation}
          onEdit={handleEditReservation}
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
                  {currentUser && post.author == currentUser.username && (
                    <button
                      onClick={() => deletePost(post.id)}
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
        initialData={editingReservation?.type === 'flight' ? editingReservation : null}
      />
      <LodgingModal
        isOpen={activeModal === 'lodging'}
        onClose={closeModal}
        onSave={(data) => handleSaveReservation('lodging', data)}
        initialData={editingReservation?.type === 'lodging' ? editingReservation : null}
      />
      <ActivityModal
        isOpen={activeModal === 'activity'}
        onClose={closeModal}
        onSave={(data) => handleSaveReservation('activity', data)}
        initialData={editingReservation?.type === 'activity' ? editingReservation : null}
      />

    </div>
  );
}
