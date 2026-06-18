import { Router } from "express";
import { uploadAvatar } from "../../config/multer.config.js";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteAvatarController,
  getProfileController,
  updateProfileController,
} from "./user.controller.js";
import { updateProfileSchema } from "./user.validator.js";

const router = Router();

router.use(authentication);

router.get("/profile", asyncHandler(getProfileController));
router.put(
  "/profile",
  uploadAvatar,
  validate(updateProfileSchema),
  asyncHandler(updateProfileController),
);
router.delete("/profile/avatar", asyncHandler(deleteAvatarController));

export default router;
