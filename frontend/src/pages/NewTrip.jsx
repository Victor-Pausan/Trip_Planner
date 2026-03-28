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
            setGroups(res.data);
        } catch (error) {
            alert(error);
        }
    };

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