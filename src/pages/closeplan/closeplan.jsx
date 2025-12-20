import { useParams } from "react-router-dom"

const Closeplan = () => {
    const { token } = useParams()
    console.log("Token:", token)
    return (
        <div>Closeplan : {token}</div>
    )
}

export default Closeplan