import api from "../api"
import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import { jwtDecode } from "jwt-decode"

function ProtectedRoute({ children, route="/login" }) {
    const [isAuthorised, setIsAuthorised] = useState(null)

    useEffect(() => {
        auth().catch(() => setIsAuthorised(false))
    }, [])

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN)

        try {
            const res = await api.post('/api/token/refresh/', {
                refresh: refreshToken
            })
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorised(true)
            } else {
                setIsAuthorised(false)
            }

        } catch (error) {
            setIsAuthorised(false)
            console.log(error);
        }
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (!token) {
            setIsAuthorised(false)
            return
        }
        const decode = jwtDecode(token)
        const tokenExpiration = decode.exp
        const now = Date.now() / 1000

        if (tokenExpiration < now) {
            await refreshToken()
        } else {
            setIsAuthorised(true)
        }
    }

    if (isAuthorised === null) {
        return <div>Loading...</div>
    }

    return isAuthorised ? children : <Navigate to={route} />
}

export default ProtectedRoute