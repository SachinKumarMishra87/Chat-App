import express from "express"
import { RegisterUser } from "../controller/registerUser.js";
import checkEmail from "../controller/checkEmail.js";
import checkPassword from "../controller/checkPassword.js";
import { userDetails } from "../controller/userDetails.js";
import logout from "../controller/logout.js";
import { updateUserDetails } from "../controller/updateUserDetails.js";
import searchUser from "../controller/searchUser.js";
import mongoose from "mongoose";

const router = express.Router();

// create user API
router.post("/register", RegisterUser)
router.post("/verify-email", checkEmail)
router.post("/verify-password", checkPassword)
router.get("/user-details", userDetails)
router.get("/logout", logout)
router.post("/update-userDetails",updateUserDetails)
router.post("/search-user", searchUser)

router.get('/users/:userId/validate', (req, res) => {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send('Invalid user ID');
    }
    res.status(200).send('User ID is valid');
});
export default router