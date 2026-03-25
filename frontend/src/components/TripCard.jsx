import { useNavigate } from "react-router-dom";

function TripCard( { trip, onDelete } ) {
    const navigate = useNavigate()

    const accessPath = () => {
        let path = `/trip/${trip.id}`
        navigate(path)
    }
    
    return (
        <>
            <h3>{trip.title}</h3>
            <p>{trip.description}</p>
            <button onClick={accessPath} >Access</button>
            <button onClick={() => onDelete(trip.id)} >Delete</button>
        </>
    );
}

export default TripCard