import AuthForm from "../components/AuthForm";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Register() {
    const [searchParams, setSearchParams] = useSearchParams();
    const next = searchParams.get("next");

    return (
        <>
            <Navbar />
            <div>
                <AuthForm route="/api/user/register/" method="register" next={next} />
            </div>
        </>
    );
}

export default Register