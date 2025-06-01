import { Router } from "express";
import { registerHandler } from "../controllers/user.controller.js";

const router=Router()


router.route("/v1/register").post(registerHandler)




export default router