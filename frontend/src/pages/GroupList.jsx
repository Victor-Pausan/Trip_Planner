import { useEffect, useState } from "react";
import api from "../api";
import GroupCard from "../components/GroupCard";
import Navbar from "../components/Navbar";

function GroupList() {
    const [groups, setGroups] = useState([]);
    const [title, setTitle] = useState("");
    const [token, setToken] = useState(null)

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get("/api/groups/");
            setGroups(res.data);
            console.log(res.data);
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
            const res = await api.post('/api/groups/', { title })
            if (res.status == 201) {
                fetchGroups();
            } else {
                alert("Group creation failed")
            }
        } catch (error) {
            alert(error)
        }
    }

    return (
        <>
            <Navbar />
            <div>
                <h2>Create a group</h2>
                <form onSubmit={createGroup}>
                    <label htmlFor="title">Title:</label>
                    <br />
                    <input
                        type="text"
                        value={title}
                        name="title"
                        id="title"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br />
                    <input type="submit" value="Submit" />
                </form>
                <br />
                <h2>Groups</h2>
                {groups.map((group) => (
                    <GroupCard group={group} onDelete={deleteGroup} key={group.id} />
                ))
                }
            </div>
        </>
    );
}

export default GroupList;
