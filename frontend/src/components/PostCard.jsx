function PostCard( { post, onDelete } ) {
    return(
    <>
        <h3>{post.title}</h3>
        <p>{post.description}</p>
        <button onClick={() => onDelete(post.id)} >Delete</button>
    </>
    );
}

export default PostCard