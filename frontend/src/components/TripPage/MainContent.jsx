import { useEffect, useState } from 'react';
import { Heart, ChevronDown, Search, ChevronRight, Plane, Bed, Car, Utensils, Paperclip, MoreHorizontal, Calendar, Users, Pencil, Plus, MessageSquare } from 'lucide-react';
import avatar from '../../assets/avatar.jpg'

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

export default function MainContent({ photoURI, trip, posts, addPost, deletePost, handleAppreciate }) {
  const [title, setTitle] = useState('');
  const [postDescription, setPostDescription] = useState('')
  const [postTitle, setPostTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    if (!isEditingTitle) setTitle(trip?.title ?? '');
  }, [trip?.title, isEditingTitle]);

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

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 relative pb-20">
      {/* Hero Section */}
      <div className="relative h-64 w-full">
        <img
          src={photoURI}
          alt="Place Picture"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
          <button className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors">
            <Pencil size={16} />
          </button>
        </div>
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
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
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

        {/* Explore Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <ChevronDown size={24} className="text-gray-400" />
              <span>Explore</span>
            </h2>
            <button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              <Search size={16} />
              <span>Browse all</span>
            </button>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
            {/* Card 1 */}
            <div className="w-64 flex-shrink-0 snap-start group cursor-pointer">
              <div className="h-40 rounded-xl overflow-hidden mb-3">
                <img src="https://picsum.photos/seed/sigiriya/400/300" alt="Sigiriya" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">Alistair Parrington's 4 Weeks Around Sri Lanka</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">Popular guide by a Wanderlog community member</p>
              <div className="flex items-center space-x-2">
                <img src="https://picsum.photos/seed/author1/24/24" alt="Author" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-xs text-gray-600">Alistair Parrington</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-64 flex-shrink-0 snap-start group cursor-pointer">
              <div className="h-40 rounded-xl overflow-hidden mb-3">
                <img src="https://picsum.photos/seed/tea/400/300" alt="Tea plantation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">jonathan perera's Hiking in Sri Lanka</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">Popular guide by a Wanderlog community member</p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">J</div>
                <span className="text-xs text-gray-600">jonathan perera</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-64 flex-shrink-0 snap-start group cursor-pointer relative">
              <div className="h-40 rounded-xl overflow-hidden mb-3">
                <img src="https://picsum.photos/seed/hotel/400/300" alt="Hotel room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">Search hotels with transparent pricing</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">Unlike most sites, we don't sort based on commissions</p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                  <Search size={12} />
                </div>
                <span className="text-xs text-gray-600">Wanderlog</span>
              </div>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Reservations and Budgeting Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Reservations and attachments</h3>
            <div className="flex justify-between items-center">
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Plane size={20} />
                </div>
                <span className="text-xs font-medium">Flight</span>
              </button>
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Bed size={20} />
                </div>
                <span className="text-xs font-medium">Lodging</span>
              </button>
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Car size={20} />
                </div>
                <span className="text-xs font-medium">Rental car</span>
              </button>
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Utensils size={20} />
                </div>
                <span className="text-xs font-medium">Restaurant</span>
              </button>
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group relative">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Paperclip size={20} />
                </div>
                <span className="text-xs font-medium">Attachment</span>
                <div className="absolute top-0 right-1 w-2 h-2 rounded-full bg-orange-500 border border-white"></div>
              </button>
              <button className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-900 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={20} />
                </div>
                <span className="text-xs font-medium">Other</span>
              </button>
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-900">Budgeting</h3>
            <div>
              <div className="text-2xl font-bold text-gray-900">RON 0.00</div>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-800 mt-1 transition-colors">View details</button>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <MessageSquare size={20} className="text-gray-400" />
              <span>Notes & Ideas</span>
            </h2>
          </div>

          <div className="space-y-6 mb-8">
            {(posts?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-sm italic text-center py-4">No notes yet. Add your ideas below!</p>
            ) : (
              posts.map(note => (
                <div key={note.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative group">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{note.title}</h3>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed whitespace-pre-wrap">{note.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={avatar} alt={note.author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-gray-900 font-medium">{note.author}</div>
                        <div className="text-gray-500 text-sm">{formatMonthDayYear(note.created_at)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAppreciate(note.id, note.hasAppreciated ? 'unlike' : 'like')}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${note.hasAppreciated ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Heart size={18} className={note.hasAppreciated ? 'fill-current' : ''} />
                      <span className="font-medium">{note.likes_count}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => deletePost(note.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>


          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add a new note</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
              />
              <textarea
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="Jot down ideas, links, or reminders..."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 bg-gray-50"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddPost}
                  disabled={!postDescription.trim() || !postTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Post Note
                </button>
              </div>
            </div>
          </div>


        </section>

      </div>
    </div>
  );
}
