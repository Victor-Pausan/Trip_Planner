import { useParams, } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api"
import PostCard from "../components/PostCard"
import Navbar from "../components/Navbar"
import MainContent from "../components/TripPage/MainContent"
import MapArea from "../components/TripPage/MapArea"
import Sidebar from "../components/TripPage/SideBar"

function Trip() {
    const { id } = useParams()
    const [message, setMessage] = useState("")
    const [trip, setTrip] = useState("")
    const [posts, setPosts] = useState([])
    const [postTitle, setPostTitle] = useState("")
    const [postDescription, setPostDescription] = useState("")

    const placeholderImg = "https://placehold.co/600x400"
    const [photoUri, setPhotoUri] = useState(placeholderImg)

    useEffect(() => {
        getTrip()
        getPosts()
    }, [])

    const getPlaceData = async (placeId) => {
        try {

            const res = await api.get(`/api/place/${placeId}/`)
            if (res.status === 200) {
                const apiPhotoUri = res.data.photoURI
                if (apiPhotoUri) {
                    setPhotoUri(apiPhotoUri)
                } else {
                    setPhotoUri(placeholderImg)
                }
            } else {
                setPhotoUri(placeholderImg)
            }
        } catch (error) {
            console.log("Error fetching" + error);
        }
    }

    const getTrip = async () => {
        try {
            const res = await api.get(`/api/trip/get/${id}/`)
            if (res.status === 200) {
                setTrip(res.data)
                await getPlaceData(res.data.place)
            } else {
                alert("Couldn't get trip.")
            }
        } catch (error) {
            alert(error)
        }
    }

    const getUser = async (id) => {
        try{
            const res = await api.get(`/api/user/${id}/`)
            if (res.status === 200) {
                console.log(res.data);
                
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
                if(res.data.length != 0){
                    const username = await getUser(res.data[0].author)
                    res.data[0].author = username
                    setPosts(res.data)
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

    return (
        <>
            <Navbar />
            {/* <div>
                <img src={photoUri} />
                {message != '' ? message : ''}
                <div>{trip.title}</div>
                <h1>Add Post:</h1>
                <form onSubmit={addPost}>
                    <label htmlFor="title">Title:</label>
                    <br />
                    <input
                        type="text"
                        value={postTitle}
                        name="title"
                        id="title"
                        onChange={(e) => setPostTitle(e.target.value)}
                    />
                    <br />
                    <label htmlFor="description">Description:</label>
                    <br />
                    <textarea
                        name="description"
                        id="description"
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                    />
                    <br />
                    <input type="submit" value="Post" />
                </form>
                <h1>Posts:</h1>
                {posts.map((post) => (
                    <PostCard post={post} onDelete={deletePost} key={post.id} />
                ))}
            </div> */}
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
                            deletePost={deletePost} />
                    </div>
                </div>

                {/* Right Side (Map) */}
                <div className="flex-1 h-full bg-blue-100 relative hidden md:block">
                    <MapArea />
                </div>
            </div>
        </>
    )
}

export default Trip