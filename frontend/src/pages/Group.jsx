import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import api from "../api";
import TripCard from "../components/TripCard";
import Navbar from "../components/Navbar";

function Group() {
    const { slug } = useParams();

    const location = useLocation()
    const [group, setGroup] = useState("")
    const [members, setMembers] = useState([])

    const [message, setMessage] = useState("")

    const [trips, setTrips] = useState([])
    const [tripTitle, setTripTitle] = useState("")
    const [tripDescription, setTripDescription] = useState("")

    useEffect(() => {
        setMessage(location.state)
        window.history.replaceState({}, document.title)

        console.log(location.state);

        getGroup()
        getTrips()
    }, [])


    const getGroup = async () => {
        try {
            console.log("Fetching group with slug:", slug);
            const res = await api.get(`/api/groups/${slug}/`)
            if (res.status === 200) {
                setGroup(res.data)
                console.log(res.data);

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
            const res = await api.get(`/api/trip/${slug}/`)
            if (res.status === 200) {
                setTrips(res.data)

            } else {
                alert("Trip fetch didn't work.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const addTrip = async (e) => {
        e.preventDefault()

        try {
            const res = await api.post(`/api/trip/${slug}/`,
                {
                    title: tripTitle,
                    description: tripDescription,
                    group: group.id
                });
            if (res.status === 201) {
                setMessage("Trip added succefuly!")
                getTrips()
            } else {
                alert("Failed to add trip.")
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
                console.log(res.data);

            }
        } catch (error) {
            alert(error)
        }

    }

    return (
        <>
            <Navbar />
            <div>
                {message != "" ? message : ''}
                <h1>{group.title}</h1>
                <h4>Members: </h4>
                <ul>
                    {members.map((member) => (
                        <li key={member.id}>{member.username}</li>
                    ))}
                </ul>
                <p>Invitation link:</p>
                <a href={'http://' + window.location.host + `/group/join/${group.slug}`}>{'http://' + window.location.host + `/group/join/${group.slug}`}</a>
                <h3>Add trip:</h3>
                <form onSubmit={addTrip}>
                    <label htmlFor="title">Title:</label>
                    <br />
                    <input
                        type="text"
                        value={tripTitle}
                        name="title"
                        id="title"
                        onChange={(e) => setTripTitle(e.target.value)}
                    />
                    <br />
                    <label htmlFor="description">Description</label>
                    <br />
                    <textarea
                        name="description"
                        id="description"
                        value={tripDescription}
                        onChange={(e) => setTripDescription(e.target.value)}
                    />
                    <br />
                    <input type="submit" value="Add Trip" />
                </form>
                <h1>Trips:</h1>
                {trips.map((trip) => (
                    <TripCard trip={trip} onDelete={deleteTrip} key={trip.id} />
                ))}
            </div>
        </>
    )
}

export default Group