import { useState } from "react"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { useUser } from "../contexts/UserContext"

function AuthForm({ route, method, next = null }) {
    const { fetchUser } = useUser();
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPassword, setConfirmedPassword] = useState("")
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isLogin = method === "login";
    const name = isLogin ? "Sign In" : "Sign Up"
    const navigate = useNavigate()

    // --- Validation ---
    const validate = () => {
        const newErrors = {}

        if (!username.trim()) {
            newErrors.username = "Username is required."
        }

        if (!isLogin) {
            if (!email.trim()) {
                newErrors.email = "Email is required."
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                newErrors.email = "Enter a valid email address."
            }
        }

        if (!password) {
            newErrors.password = "Password is required."
        }

        if (!isLogin && !confirmedPassword) {
            newErrors.confirmedPassword = "Please confirm your password."
        } else if (!isLogin && password !== confirmedPassword) {
            newErrors.confirmedPassword = "Passwords don't match."
        }

        return newErrors
    }

    // Map DRF field errors onto our errors state
    const parseDRFErrors = (data) => {
        const newErrors = {}
        const fieldMap = {
            username: "username",
            email: "email",
            password: "password",
            non_field_errors: "general",
            detail: "general",
        }
        for (const [key, value] of Object.entries(data)) {
            const mapped = fieldMap[key] || key
            newErrors[mapped] = Array.isArray(value) ? value[0] : value
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setErrors({})
        setLoading(true);

        try {
            if (isLogin) {
                const res = await api.post(route, { username, password })
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh)
                await fetchUser()
                navigate(next ? `/group/join/${next}` : '/')
            } else {
                const res = await api.post(route, { username, email, password })
                // Auto-login after registration
                const auth_res = await api.post('/api/token/', { username, password })
                localStorage.setItem(ACCESS_TOKEN, auth_res.data.access)
                localStorage.setItem(REFRESH_TOKEN, auth_res.data.refresh)
                await fetchUser()
                navigate(next ? `/group/join/${next}` : '/')
            }
        } catch (error) {
            if (error.response?.data && typeof error.response.data === "object") {
                setErrors(parseDRFErrors(error.response.data))
            } else {
                setErrors({ general: "Something went wrong. Please try again." })
            }
        } finally {
            setLoading(false)
        }
    }

    const clearFieldError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const EyeIcon = ({ open }) => open ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    )

    const FieldError = ({ field }) => errors[field] ? (
        <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
    ) : null

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
            errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
        }`

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-3 transition-transform hover:scale-105">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-sky-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="-6 0 32 32" version="1.1">
                            <title>airplane</title>
                            <path d="M6.72 26.2c-0.040 0-0.080 0-0.12 0-0.28-0.040-0.48-0.2-0.64-0.44l-1.96-3.56-3.56-1.96c-0.24-0.12-0.4-0.36-0.44-0.64s0.040-0.52 0.24-0.72l1.8-1.8c0.2-0.2 0.48-0.28 0.76-0.24l2.040 0.36 2.68-2.68-6.48-3.2c-0.24-0.12-0.4-0.36-0.48-0.64s0.040-0.56 0.24-0.76l2-2c0.2-0.2 0.52-0.28 0.8-0.24l8.48 2.2 2.96-2.96c1.040-1.040 3.48-1.8 4.72-0.56 0.56 0.56 0.76 1.48 0.56 2.52-0.16 0.84-0.6 1.64-1.12 2.16l-2.96 2.96 2.2 8.48c0.080 0.28 0 0.6-0.24 0.8l-2 2c-0.2 0.2-0.48 0.28-0.76 0.24s-0.52-0.2-0.64-0.48l-3.2-6.48-2.68 2.68 0.36 2.040c0.040 0.28-0.040 0.56-0.24 0.76l-1.8 1.8c-0.080 0.28-0.28 0.36-0.52 0.36zM2.24 19.28l2.8 1.52c0.16 0.080 0.24 0.2 0.32 0.32l1.52 2.8 0.68-0.68-0.32-2.040c-0.040-0.28 0.040-0.56 0.24-0.76l3.84-3.84c0.2-0.2 0.48-0.28 0.76-0.24s0.52 0.2 0.64 0.48l3.2 6.48 0.8-0.8-2.2-8.48c-0.080-0.28 0-0.6 0.24-0.8l3.28-3.28c0.6-0.6 0.92-1.96 0.56-2.32s-1.72 0-2.32 0.56l-3.28 3.28c-0.2 0.2-0.52 0.56-0.8 0.24l-8.52-2.2-0.8 0.8 6.48 3.2c0.24 0.12 0.4 0.36 0.48 0.64s-0.040 0.56-0.24 0.76l-3.84 3.84c-0.2 0.2-0.48 0.28-0.76 0.24l-2.040-0.36-0.72 0.64z" />
                        </svg>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">Tripstoo</span>
                </div>
                <div className="text-center mb-8">
                    <p className="text-gray-600">Plan your next adventure! {name} to continue.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{name}</h2>

                    {/* General / non-field error */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                {isLogin ? 'Email/Username' : 'Username'}
                            </label>
                            {!isLogin && (
                                <p className="text-xs text-gray-500 mb-1">
                                    You can also log in with your email address later.
                                </p>
                            )}
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); clearFieldError("username") }}
                                placeholder={isLogin ? 'email / username' : "username"}
                                autoComplete="username"
                                className={inputClass("username")}
                            />
                            <FieldError field="username" />
                        </div>

                        {/* Email — Sign Up only */}
                        {!isLogin && (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); clearFieldError("email") }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className={inputClass("email")}
                                />
                                <FieldError field="email" />
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); clearFieldError("confirmedPassword") }}
                                    placeholder="••••••••"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    className={inputClass("password") + " pr-12"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            <FieldError field="password" />
                        </div>

                        {/* Confirm Password — Sign Up only */}
                        {!isLogin && (
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmedPassword}
                                        onChange={(e) => { setConfirmedPassword(e.target.value); clearFieldError("confirmedPassword") }}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className={inputClass("confirmedPassword") + " pr-12"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                <FieldError field="confirmedPassword" />
                            </div>
                        )}

                        {/* Forgot Password */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-blue-500 hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-br from-green-400 to-sky-400 text-black font-semibold rounded-lg hover:scale-105 focus:ring-4 focus:ring-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {isLogin ? "Signing in..." : "Creating account..."}
                                </span>
                            ) : name}
                        </button>
                    </form>

                    {/* Register / Login Link */}
                    <p className="mt-6 text-center text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a
                            href={isLogin ? "/register" : "/login"}
                            className="text-blue-600 font-semibold hover:text-blue-700"
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthForm