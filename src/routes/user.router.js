import { Router } from "express";
import { loginUser, logutUser, registerHandler,getRefreshTokenaccess } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { modelusercontroller,modelusercount,addsubjects, getsubjecthistory} from "../controllers/userdata.controllers.js";

const router = Router();

router.route("/v1/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerHandler
);

router.route("/v1/login").post(loginUser)
router.route("/v1/refresh-token").post(getRefreshTokenaccess)
router.route("/v1/adduser-data").post(modelusercontroller).get(modelusercount)
router.route("/v1/add-subjects").post(addsubjects)
router.route("/v1/get-subjects").post(getsubjecthistory)



//secured routes

router.route("/v1/log-out").post(verifyJWT,logutUser)


export default router;
