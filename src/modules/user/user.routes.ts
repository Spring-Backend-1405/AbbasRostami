import { Router } from "express";
import { uploadAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteAvatarController,
  getProfileController,
  getProfileOverviewController,
  getUserByIdController,
  getUsersController,
  updateProfileController,
} from "./user.controller.js";
import {
  getUserByIdSchema,
  listUsersSchema,
  updateProfileSchema,
} from "./user.validator.js";

const router = Router();

router.use(authentication);

// ─── User Profile
router.get("/profile/overview", asyncHandler(getProfileOverviewController));
router.get("/profile", asyncHandler(getProfileController));
router.put(
  "/profile",
  uploadAvatar,
  validate(updateProfileSchema),
  asyncHandler(updateProfileController),
);
router.delete("/profile/avatar", asyncHandler(deleteAvatarController));

// ─── Admin: User Management
router.get(
  "/",
  authorize("ADMIN"),
  validate(listUsersSchema),
  asyncHandler(getUsersController),
);

router.get(
  "/:id",
  authorize("ADMIN"),
  validate(getUserByIdSchema),
  asyncHandler(getUserByIdController),
);

export default router;
