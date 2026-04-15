import React from 'react';
import { X, Check as CheckIcon, X as XIcon } from 'lucide-react';

export default function MembersModal({ isOpen, onClose, members, requests, currentUserRole, onAcceptRequest, onDeclineRequest }) {
  if (!isOpen) return null;

  // Sort members: admin first
  const sortedMembers = [...(members || [])].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  const isAdmin = currentUserRole == 'admin';
  
  return (
    <div className="fixed inset-0 bg-black/15 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-[440px] bg-white/75 border border-white/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative max-h-[80vh]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="px-6 pt-6 pb-4 border-b border-black/5 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Group Info</h2>
        </div>

        <div className="overflow-y-auto flex-1">
          {isAdmin && requests && requests.length > 0 && (
            <>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-6 pt-4 pb-2">
                Join Requests ({requests.length})
              </div>
              <div className="px-2 pb-2">
                {requests.map(request => (
                  <div key={request.id} className="flex items-center px-4 py-2.5 rounded-xl transition-colors hover:bg-white/50">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-sm mr-3 shrink-0">
                      {request.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{request.user}</div>
                      <div className="text-xs font-medium text-gray-500 truncate">Requesting access</div>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button 
                        onClick={() => onAcceptRequest(request.id)}
                        className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center hover:bg-green-200 transition-colors"
                      >
                        <CheckIcon size={16} />
                      </button>
                      <button 
                        onClick={() => onDeclineRequest(request.id)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-black/5 mx-6 my-2"></div>
            </>
          )}

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-6 pt-4 pb-2">
              Group Members
            </div>
            <div className="px-2 pb-6">
              {sortedMembers.map((member, index) => {
                // Alternate avatar colors based on index for a bit of variety, similar to the design
                const avatarColors = [
                  'bg-teal-100 text-teal-800',
                  'bg-purple-100 text-purple-800',
                  'bg-gray-100 text-gray-800',
                  'bg-orange-100 text-orange-800'
                ];
                const colorClass = avatarColors[index % avatarColors.length];

                return (
                  <div key={member.id} className="flex items-center px-4 py-2.5 rounded-xl transition-colors hover:bg-white/50">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm mr-3 shrink-0 ${colorClass}`}>
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{member.username}</div>
                      <div className="text-xs font-medium text-gray-500 truncate">
                        {member.role === 'admin' ? 'Administrator' : member.role === 'moderator' ? 'Moderator' : 'Member'}
                      </div>
                    </div>
                    {member.role === 'admin' && (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-3">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
