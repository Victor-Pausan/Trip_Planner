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
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-sky-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-center items-start  md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2 cursor-pointer hover:bg-gray-100 rounded px-2 -ml-2 py-1 transition-colors">
                                {title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-center">
                                <form onSubmit={processToken}>
                                    <input type="submit" className={`w-full bg-gradient-to-br text-white from-green-400 to-sky-400  font-bold 
                                        py-10 px-10 rounded-xl shadow-lg transition-all 
                                        duration-200 mt-4 flex items-center justify-center gap-2
                                        hover:shadow-xl hover:-translate-y-0.5 transform cursor-pointer
                                    `} value={`Join Group`} />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
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