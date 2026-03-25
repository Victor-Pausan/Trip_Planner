import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import AuthForm from "../components/AuthForm"
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";


function Login() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const [message, setMessage] = useState("")
    const next = searchParams.get("next");

    useEffect(() => {
        if (next) {
            setMessage("You need to login in order to join this group.")
        }
    }, [])

    const registerRedirect = () => {
        navigate('/register' + (next ? `?next=${next}` : ''))
    }

    return (
        <>
            <Navbar />
            <div>
                {message !== "" ? message : ''}
                <AuthForm route="/api/token/" method="login" next={next} />
                <br />
                <button onClick={registerRedirect}>Register here</button>
            </div>
        </>
    )
}

export default Login