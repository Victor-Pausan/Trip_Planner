import { useParams, } from "react-router-dom"
import { useEffect, useState } from "react"
import { useUser } from "../contexts/UserContext"
import api from "../api"
import MainContent from "../components/TripPage/MainContent"
import MapArea from "../components/TripPage/MapArea"

function Trip() {
    const { id } = useParams()
    const { user } = useUser()
    const [message, setMessage] = useState("")
    const [trip, setTrip] = useState("")
    const [posts, setPosts] = useState([])
    const [placeLocation, setPlaceLocation] = useState(null)
    const [mapReadyToRender, setMapReadyToRender] = useState(false)
    const [userRole, setUserRole] = useState('')
    const [joinRequests, setJoinRequests] = useState([])
    const [members, setMembers] = useState([])

    const [reservations, setReservations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const [photoUri, setPhotoUri] = useState(null)
    const [isPhotoLoading, setIsPhotoLoading] = useState(true)

    useEffect(() => {
        getTrip()
        getPosts()
        getFlights()
        getLodgings()
        getActivities()
        getSuggestions()
    }, [])

    const getPlaceData = async (placeId) => {
        try {

            const res = await api.get(`/api/place/${placeId}/`)
            if (res.status === 200) {
                const apiPhotoUri = res.data.photoURI
                const latitude = parseFloat(res.data.latitude)
                const longitude = parseFloat(res.data.longitude)

                setPlaceLocation({ lat: latitude, lng: longitude })
                setMapReadyToRender(true)
                setPhotoUri(apiPhotoUri || null)
            }
        } catch (error) {
            console.log("Error fetching" + error);
        } finally {
            setIsPhotoLoading(false)
        }

    }

    const getTrip = async () => {
        try {
            const res = await api.get(`/api/trip/get/${id}/`)
            if (res.status === 200) {
                await getPlaceData(res.data.place)
                await getUserRole(res.data.group)
                await getGroupMembers(res.data.group)
                setTrip(res.data)
            } else {
                alert("Couldn't get trip.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const getUser = async (id) => {
        try {
            const res = await api.get(`/api/user/${id}/`)
            if (res.status === 200) {
                return res.data.username
            }
        } catch (error) {
            alert(error)
        }
    }

    const getPosts = async () => {
        try {
            const res = await api.get(`/api/post/${id}/`)
            if (res.status === 200) {
                if (res.data.length != 0) {
                    const postsWithFullData = await Promise.all(
                        res.data.map(async (post) => {
                            const username = await getUser(post.author)
                            post.author = username
                            post.hasAppreciated = await hasAppreciated(post.id)
                            return { ...post, author: username, hasAppreciated: await hasAppreciated(post.id) }
                        })
                    )
                    setPosts(postsWithFullData)
                }
            } else {
                setMessage("No posts available yet.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const addPost = async (newPost) => {
        try {
            const res = await api.post(`/api/post/${id}/`, {
                description: newPost.description,
                title: newPost.title
            });
            if (res.status === 201) {
                setMessage("Post added!")
                getPosts()
            } else {
                setMessage("Something went wrong...")
            }
        } catch (error) {
            alert(error)
        }
    }

    const deletePost = async (post_id) => {
        try {
            const res = await api.delete(`/api/post/delete/${post_id}/`)
            if (res.status === 204) {
                setPosts(posts.filter((post) => post.id != post_id))
                setMessage("Post deleted succesfully")
            } else {
                setMessage("Failed to delete post")
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleAppreciate = async (post_id, action) => {
        try {
            const res = await api.patch(`/api/post/update/${post_id}/?action=${action}`)
            if (res.status === 200) {
                setPosts(posts.map((post) => {
                    if (post.id == post_id) {
                        if (action == 'like') {
                            post.likes_count += 1;
                            post.hasAppreciated = true
                        }
                        else if (action == 'unlike') {
                            post.likes_count -= 1;
                            post.hasAppreciated = false
                        }
                    }
                    return post
                }))
            }
        } catch (error) {
            alert(error)
        }
    }

    const hasAppreciated = async (post_id) => {
        try {
            const res = await api.get(`/api/post/liked/${post_id}/`)
            if (res.status === 200) {
                return res.data
            }

        } catch (error) {
            alert(error)
        }
    }

    const updateTripTitle = async (newTitle) => {
        try {
            const res = await api.patch(
                `/api/trip/update/title/${trip.id}/`,
                {
                    title: newTitle
                }
            )
        } catch (error) {
            alert(error)
        }
    }

    const getFlights = async () => {
        try {
            const res = await api.get(`/api/flight/${id}/`)
            if (res.status === 200) {
                const flightWithFullData = await Promise.all(
                    res.data.map(async (f) => {
                        const username = await getUser(f.author)
                        return { ...f, type: 'flight', author: username }
                    })
                )
                setReservations((reservs) => [...reservs, ...flightWithFullData])
            }
        } catch (error) {
            alert(error)
        }
    }

    const getLodgings = async () => {
        try {
            const res = await api.get(`/api/lodging/${id}/`)
            if (res.status === 200) {
                const lodgingWithFullData = await Promise.all(
                    res.data.map(async (f) => {
                        var username = await getUser(f.author)
                        if (f.place) {
                            const res2 = await api.get(`/api/place/${f.place}/`)
                            if (res2.status === 200) {
                                const latitude = parseFloat(res2.data.latitude)
                                const longitude = parseFloat(res2.data.longitude)
                                const placeName = res2.data.name
                                const photoURI = res2.data.photoURI
                                const address = res2.data.address
                                const rating = res2.data.rating
                                const websiteUri = res2.data.websiteUri
                                return {
                                    ...f, type: 'lodging', author: username, latitude: latitude, longitude: longitude, placeName: placeName, photoURI: photoURI, address: address, rating: rating,
                                    websiteUri: websiteUri
                                }
                            }
                        }
                        return { ...f, type: 'lodging', author: username }
                    })
                )
                setReservations((reservs) => [...reservs, ...lodgingWithFullData])
            }
        } catch (error) {
            alert(error)
        }
    }

    const getActivities = async () => {
        try {
            const res = await api.get(`/api/activity/${id}/`)
            if (res.status === 200) {
                const activityWithFullData = await Promise.all(
                    res.data.map(async (f) => {
                        var username = await getUser(f.author)
                        if (f.place) {
                            const res2 = await api.get(`/api/place/${f.place}/`)
                            if (res2.status === 200) {
                                const latitude = parseFloat(res2.data.latitude)
                                const longitude = parseFloat(res2.data.longitude)
                                const placeName = res2.data.name
                                const photoURI = res2.data.photoURI
                                const address = res2.data.address
                                const rating = res2.data.rating
                                const websiteUri = res2.data.websiteUri
                                return {
                                    ...f, type: 'activity', author: username, latitude: latitude, longitude: longitude, placeName: placeName, photoURI: photoURI, address: address, rating: rating,
                                    websiteUri: websiteUri
                                }
                            }
                        }
                        return { ...f, type: 'activity', author: username }
                    })
                )
                setReservations((reservs) => [...reservs, ...activityWithFullData])
            }
        } catch (error) {
            alert(error)
        }
    }

    const addReservation = async (type, data) => {
        try {
            const res = await api.post(`/api/${type}/${trip.id}/`, data)
            if (res.status === 201) {
                res.data.author = user.username
                var newReservation = {}
                if (res.data.place) {
                    const res2 = await api.get(`/api/place/${res.data.place}/`)
                    if (res2.status === 200) {
                        const latitude = parseFloat(res2.data.latitude)
                        const longitude = parseFloat(res2.data.longitude)
                        const placeName = res2.data.name
                        const photoURI = res2.data.photoURI
                        const address = res2.data.address
                        const rating = res2.data.rating
                        const websiteUri = res2.data.websiteUri
                        newReservation = {
                            ...res.data,
                            latitude: latitude,
                            longitude: longitude,
                            placeName: placeName,
                            photoURI: photoURI,
                            address: address,
                            rating: rating,
                            websiteUri: websiteUri,
                            type
                        };
                    }
                } else {
                    newReservation = {
                        ...res.data,
                        type,
                    };
                }

                setReservations((reservs) => [...reservs, newReservation]);
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleEditReservation = async (reservation, data) => {
        try {
            const res = await api.put(`/api/${reservation.type}/update/${reservation.id}/`, data)
            if (res.status === 200) {
                setReservations(reservations.map(r =>
                    (r.id === reservation.id) && (r.type === reservation.type) ? { ...data } : r
                ));
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleDeleteReservation = async (id, type) => {
        try {
            const res = await api.delete(`/api/${type}/delete/${id}/`)
            if (res.status === 204) {
                setReservations(reservations.filter(r => (r.id !== id) || (r.type != type)));
            }
        } catch (error) {
            alert(error)
        }
    }

    const getUserRole = async (slug) => {
        try {
            const res = await api.get(`/api/groups/token/user_role/${slug}/`)
            if (res.status === 200) {
                setUserRole(res.data[0].role);
                if (res.data[0].role == "admin")
                    await getJoinRequests(slug)
            }
        } catch (error) {
            alert(error)
        }
    }

    const getJoinRequests = async (slug) => {
        try {
            const res = await api.get(`/api/groups/token/process/${slug}/`)
            if (res.status === 200) {
                if (res.data.length != 0) {
                    const joinRequests = await Promise.all(
                        res.data.map(async (joinRequest) => {
                            const user = await getUser(joinRequest.user)
                            return { ...joinRequest, user: user }
                        })
                    )
                    setJoinRequests(joinRequests)
                }
            }
        } catch (error) {
            alert(error)
        }
    }

    const getGroupMembers = async (slug) => {
        try {
            const res = await api.get(`/api/groups/members/${slug}/`)
            if (res.status === 200) {
                setMembers(res.data)
            }
        } catch (error) {
            alert(error)
        }

    }

    const acceptJoinRequest = async (id) => {
        try {
            const res = await api.patch(`/api/groups/add/user/${id}/`)
            if (res.status === 200) {
                setJoinRequests(joinRequests.filter((req) => req.id != id))
                getGroupMembers(trip.group)
            }
        } catch (error) {
            alert(error)
        }
    }

    const declineJoinRequest = async (id) => {
        try {
            const res = await api.delete(`/api/groups/delete/join_request/${id}/`)
            if (res.status === 204) {
                setJoinRequests(joinRequests.filter((req) => req.id != id))
            }
        } catch (error) {
            alert(error)
        }
    }

    const editTripDates = async (data) => {
        try {
            const res = await api.patch(`/api/trip/update/dates/${id}/`, data)
            if (res.status === 200) {
                setTrip({ ...trip, start_date: data.start_date, end_date: data.end_date })
            }
        } catch (error) {
            alert(error)
        }
    }

    const getSuggestions = async () => {
        try {
            const res = await api.get(`/api/suggestions/get/${id}/`)
            if (res.status === 200) {
                const suggestionsWithFullData = await Promise.all(
                    res.data.map(async (f) => {
                        if (f.place) {
                            const res2 = await api.get(`/api/place/${f.place}/`)
                            if (res2.status === 200) {
                                const latitude = parseFloat(res2.data.latitude)
                                const longitude = parseFloat(res2.data.longitude)
                                const placeName = res2.data.name
                                const address = res2.data.address
                                const rating = res2.data.rating
                                const photoUri = res2.data.photoURI
                                return { ...f, location: { lat: latitude, lng: longitude }, photoURI: photoUri, placeName: placeName, address: address, rating: rating }
                            }
                        }
                        return f
                    })
                )
                setSuggestions((reservs) => [...reservs, ...suggestionsWithFullData])
            }
        } catch (error) {
            alert(error)
        }
    }

    const acceptSuggestion = async (suggestion_id) => {
        try {
            const res = await api.post(`/api/accept/suggestion/${suggestion_id}/`)
            if (res.status == 201) {
                var activityWithFullData = {}
                const f = res.data.activity
                var username = await getUser(f.author)
                if (f.place) {
                    const res2 = await api.get(`/api/place/${f.place}/`)
                    if (res2.status === 200) {
                        const latitude = parseFloat(res2.data.latitude)
                        const longitude = parseFloat(res2.data.longitude)
                        const placeName = res2.data.name
                        const photoURI = res2.data.photoURI
                        const address = res2.data.address
                        const rating = res2.data.rating
                        const websiteUri = res2.data.websiteUri
                        activityWithFullData = {
                            ...f, type: 'activity', author: username, latitude: latitude, longitude: longitude, placeName: placeName, photoURI: photoURI, address: address, rating: rating,
                            websiteUri: websiteUri
                        }
                    }
                }
                else activityWithFullData = { ...f, type: 'activity', author: username }
                setSuggestions(suggestions.filter((s) => s.id != suggestion_id))
                setReservations((reservs) => [...reservs, activityWithFullData])
            }

        } catch (error) {
            alert(error)
        }
    }

    const dismissSuggestion = async (suggestion_id) => {
        try {
            const res = await api.delete(`/api/reject/suggestion/${suggestion_id}/`)
            if (res.status === 204) {
                setSuggestions(suggestions.filter((s) => s.id != suggestion_id))
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleAddSuggestion = async (data) => {
        const suggestionsWithFullData = await Promise.all(
            data.map(async (f) => {
                if (f.place) {
                    const res2 = await api.get(`/api/place/${f.place}/`)
                    if (res2.status === 200) {
                        const latitude = parseFloat(res2.data.latitude)
                        const longitude = parseFloat(res2.data.longitude)
                        const placeName = res2.data.name
                        const address = res2.data.address
                        const rating = res2.data.rating
                        const photoUri = res2.data.photoURI
                        return { ...f, location: { lat: latitude, lng: longitude }, photoURI: photoUri, placeName: placeName, address: address, rating: rating }
                    }
                }
                return f
            })
        )
        setSuggestions((reservs) => [...reservs, ...suggestionsWithFullData])
    }

    return (
        <>
            <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-gray-800">
                {/* Left Side (App) */}
                <div className="flex flex-col flex-1 h-full min-w-[600px] max-w-[800px] lg:max-w-[60%] border-r border-gray-200 z-10 shadow-xl">
                    <div className="flex flex-1 overflow-hidden">
                        {/* <Sidebar /> */}
                        <MainContent
                            photoURI={photoUri}
                            trip={trip}
                            posts={posts}
                            addPost={addPost}
                            deletePost={deletePost}
                            handleAppreciate={handleAppreciate}
                            isPhotoLoading={isPhotoLoading}
                            onTitleSave={updateTripTitle}
                            reservations={reservations}
                            addReservation={addReservation}
                            deleteReservation={handleDeleteReservation}
                            editReservation={handleEditReservation}
                            joinRequests={joinRequests}
                            members={members}
                            currentUserRole={userRole}
                            onAcceptRequest={acceptJoinRequest}
                            onDeclineRequest={declineJoinRequest}
                            editTripDates={editTripDates}
                            changeMapCenter={(latitude, longitude) => { setPlaceLocation({ lat: latitude, lng: longitude }) }}
                            handleMembersChange={setMembers}
                            suggestions={suggestions}
                            handleAddSuggestions={handleAddSuggestion}
                            suggestionAccept={acceptSuggestion}
                            suggestionDismiss={dismissSuggestion}
                        />
                    </div>
                </div>

                {/* Right Side (Map) */}
                <div className="flex-1 h-full bg-blue-100 relative hidden md:block">
                    {mapReadyToRender ?
                        <MapArea
                            mainLocation={placeLocation}
                            reservations={reservations}
                            suggestions={suggestions}
                            addReservation={(newReservation) => setReservations((reservs) => [...reservs, newReservation])}
                            userRole={userRole}
                            tripId={id}
                        /> : ''}
                </div>
            </div>
        </>
    )
}

export default Trip