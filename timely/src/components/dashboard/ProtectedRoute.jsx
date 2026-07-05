import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children, role }) => {

    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("role")

    // IF TOKEN NOT PRESENT, REDIRECT TO LOGIN
    if (!token) {
        return <Navigate to="/" />
    }

    // IF ROLE IS SPECIFIED AND USER ROLE DOESN'T MATCH, REDIRECT TO LOGIN
    if (role && role !== userRole) {
        return <Navigate to="/" />
    }

    return children
}

export default ProtectedRoute