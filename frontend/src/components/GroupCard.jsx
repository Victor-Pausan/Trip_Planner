import { useNavigate } from "react-router-dom"

function GroupCard({ group, onDelete }) {
    const navigate = useNavigate()

    const accessGroup = () => {
        let path = `/group/${group.slug}`
        navigate(path)
    }
    
    return (
        <>
            <div>
                <h3>{group.title}</h3>
                <button onClick={accessGroup}>Access</button>
                <button onClick={() => onDelete(group.id)}>Delete</button>
            </div>
            <br />
        </>
    )
}

export default GroupCard