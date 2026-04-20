import React from 'react';
import { X, Check as CheckIcon, X as XIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../../api';

const ROLES = ['member', 'organiser'];
const roleLabel = (role) =>
  ({ admin: 'Administrator', organiser: 'Organiser', member: 'Member' }[role] ?? role);

function RolePicker({ memberId, currentRole, onRoleChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-3 shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium transition-colors
          ${open
            ? 'bg-black/5 border-black/20 text-gray-700'
            : 'border-black/10 text-gray-500 hover:bg-black/5 hover:border-black/20'}`}
      >
        {roleLabel(currentRole)}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-black/10 rounded-xl shadow-lg z-50 min-w-[140px] p-1">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => { onRoleChange(memberId, role); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${role === 'organiser' ? 'bg-teal-400' : 'bg-gray-300'}`} />
              <span className={currentRole === role ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                {roleLabel(role)}
              </span>
              {currentRole === role && <CheckIcon size={13} className="ml-auto text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersModal({ isOpen, onClose, members, requests, groupSlug, currentUser, currentUserRole, onAcceptRequest, onDeclineRequest, handleMembersChange }) {
  if (!isOpen) return null;

  // Sort members: admin first
  const sortedMembers = [...(members || [])].sort((a, b) => {
    if(a.username == currentUser.username) {a.username += " (You)"}
    if(b.username == currentUser.username) {b.username += " (You)"}
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  const isAdmin = currentUserRole == 'admin';

  const onRoleChange = async (memberId, newRole) => {
    try {
      const res = await api.patch(`/api/groups/members/update/role/`, {
        group_slug: groupSlug,
        user_id: memberId,
        new_role: newRole
      })
      if (res.status === 200) {
        handleMembersChange((prevMembers) =>
          prevMembers.map((m) => (m.id == memberId ? { ...m, role: newRole } : m))
        )
      }
    } catch (error) {
      alert(error)
    }
  }

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
                        {member.role === 'admin' ? 'Administrator' : member.role === 'organiser' ? 'Organiser' : 'Member'}
                      </div>
                    </div>
                    {member.role === 'admin' ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ml-3">
                        Admin
                      </span>
                    ) : isAdmin ? (
                      <RolePicker
                        memberId={member.id}
                        currentRole={member.role}
                        onRoleChange={onRoleChange}
                      />
                    ) : null}
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
