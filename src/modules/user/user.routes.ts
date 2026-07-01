import { Router } from "express";
import { uploadAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteAvatarController,
  getProfileController,
  getProfileOverviewController,
  updateProfileController,
} from "./user.controller.js";
import { updateProfileSchema } from "./user.validator.js";

const router = Router();

router.use(authentication);

router.get("/profile/overview", asyncHandler(getProfileOverviewController));

router.get("/profile", asyncHandler(getProfileController));
router.put(
  "/profile",
  uploadAvatar,
  validate(updateProfileSchema),
  asyncHandler(updateProfileController),
);
router.delete("/profile/avatar", asyncHandler(deleteAvatarController));

export default router;
