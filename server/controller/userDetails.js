
import getUserDetailsFromToken from "../helper/getUserDetailsFromToken.js"

export async function userDetails(request,response){
    try {
        const token = request?.cookies?.token || ""

        const user = await getUserDetailsFromToken(token)

        return response.status(200).json({
            message : "user details",
            data : user,
            token : token,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

