import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MapPin, Calendar, Users } from "lucide-react";

function Home() {
    const navigate = useNavigate()

    const routeChange = () => {
        let path = '/group'
        navigate(path)
    }

    return (
        <>
            
            <div className="min-h-screen bg-background">
            <Navbar />
                {/* Hero Section */}
                <main className="container mx-auto px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-8 inline-flex rounded-full bg-sky-400/10 px-4 py-2">
                            <span className="text-sm font-medium text-sky-400">Plan • Track • Remember</span>
                        </div>

                        <h1 className="mb-4 max-w-3xl text-5xl font-bold leading-tight text-foreground md:text-6xl">
                            Your Journey,
                            <br />
                            <span className="bg-gradient-to-r from-green-400 to-sky-400 bg-clip-text text-transparent">
                                Beautifully Organized
                            </span>
                        </h1>

                        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
                            Keep track of all your adventures in one place. Plan your next trip, organize memories, and share experiences with fellow travelers.
                        </p>

                        {/* Feature Cards */}
                        <div className="mt-16 grid w-full max-w-4xl gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Track Destinations</h3>
                                <p className="text-sm text-muted-foreground">
                                    Map out all the places you've been and want to go. Never forget a destination.
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                                    <Calendar className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Plan Trips</h3>
                                <p className="text-sm text-muted-foreground">
                                    Organize your itineraries, bookings, and important travel details in one spot.
                                </p>
                            </div>

                            <div className="rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-card-foreground">Share Memories</h3>
                                <p className="text-sm text-muted-foreground">
                                    Connect with friends and share your favorite travel stories and tips.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>

    );
}

export default Home