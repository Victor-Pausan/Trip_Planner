import { useEffect, useState } from "react";
import api from "../api";
import GroupCard from "../components/GroupCard";
import Navbar from "../components/Navbar";
import { Link } from 'react-router-dom';
import { Users, Trash2, ArrowRight, Plus } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    if (isOpen === '') return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Reservation</h3>
                    <p className="text-gray-600 text-sm">Are you sure you want to delete this group? This action cannot be undone.</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
                </div>
            </div>
        </div>
    );
};

function GroupList() {
    const [groups, setGroups] = useState([]);
    const [newGroupTitle, setNewGroupTitle] = useState("");
    const [activeModal, setActiveModal] = useState('')

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get("/api/groups/");
            setGroups(res.data);
        } catch (error) {
            alert(error);
        }
    };

    const deleteGroup = async (id) => {
        try {
            const res = await api.delete(`/api/groups/delete/${id}/`);
            if (res.status === 204) {
                setGroups(groups.filter((group) => group.id !== id));
            } else {
                alert("Failed to delete group...");
            }
        } catch (error) {
            alert(error);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault()

        try {
            if (newGroupTitle) {
                const res = await api.post('/api/groups/', { title: newGroupTitle })
                if (res.status == 201) {
                    fetchGroups();
                    setNewGroupTitle('')
                } else {
                    alert("Group creation failed")
                }
            }
        } catch (error) {
            alert(error)
        }
    }

    return (
        <>
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">My Groups</h1>
                        <p className="text-gray-500 mt-1">Manage your travel groups and start planning.</p>
                    </div>

                    <form onSubmit={createGroup} className="flex w-full md:w-auto gap-2">
                        <input
                            type="text"
                            placeholder="New group name..."
                            value={newGroupTitle}
                            onChange={(e) => setNewGroupTitle(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-2.5 w-full md:w-64 shadow-sm outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newGroupTitle}
                            className="disabled:bg-gray-400 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={16} /> Create
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full relative group">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">{group.title}</h3>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                <Link
                                    to={`/group/${group.slug}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    Access Group <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={() => setActiveModal(group.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                    title="Delete Group"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DeleteModal 
                isOpen={activeModal}
                onClose={() => setActiveModal('')}
                onConfirm={() => {deleteGroup(activeModal); setActiveModal('')}}
            />
        </>
    );
}

export default GroupList;
