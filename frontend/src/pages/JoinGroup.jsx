import { Navigate, useNavigate, useParams } from "react-router-dom"
import api from "../api"
import ProtectedRoute from "../components/ProtectedRoute"
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

function GroupJoinForm() {
    const { token } = useParams()
    const [title, setTitle] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        getTitle()
    }, [])

    const getTitle = async () => {
        try {
            const res = await api.get(`/api/groups/token/${token}/`)
            if (res.status === 200) {
                setTitle(res.data.title)
            } else {
                alert("404")
            }
        } catch (error) {
            alert(error)
        }
    }

    const processToken = async (e) => {
        e.preventDefault()

        try {
            const res = await api.patch(`/api/groups/token/process/${token}/`)
            if (res.status === 200) {
                console.log(res.data);
                navigate(`/group/${res.data.group.slug}`, { state: res.data.message })
            }
        } catch (error) {
            alert(error)
        }
    }

    return (
        <>
            <Navbar />
            <div>
                <form onSubmit={processToken}>
                    <input type="submit" value={`Join Group: ${title}`} />
                </form>
            </div>
        </>
    )
}

function JoinGroup() {
    const { token } = useParams()

    return (
        <ProtectedRoute route={'/login?next=' + token}>
            <GroupJoinForm />
        </ProtectedRoute>
    )
}

export default JoinGroup