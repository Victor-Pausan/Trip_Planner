import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import TripForm from "../components/TripForm";
import api from "../api"

const NewTrip = () => {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        fetchGroups();
    }, [])

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

    return (
        <>
            <Navbar />

            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-white p-4">
                <TripForm groups={groups} />
            </div>
        </>
    );
}

export default NewTrip