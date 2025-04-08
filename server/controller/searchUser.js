import UserModel from "../models/UserModel.js"

async function searchUser(req, res) {
    try {
        const { search } = req.body

        const query = new RegExp(search, "i", "g")

        const user = await UserModel.find({
            "$or": [
                { name: query },
                { email: query }
            ]
        }).select("-password")

        return res.status(200).json({
            data: user,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error" || error,
            error: true
        })
    }
}
export default searchUser