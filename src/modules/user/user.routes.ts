import { Router } from "express";
import { uploadAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  banUserController,
  deleteAvatarController,
  getBannedUsersController,
  getProfileController,
  getProfileOverviewController,
  getUserByIdController,
  getUsersController,
  unbanUserController,
  updateProfileController,
} from "./user.controller.js";
import {
  banUserSchema,
  getUserByIdSchema,
  listBannedUsersSchema,
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
  "/blacklist",
  authorize("ADMIN"),
  validate(listBannedUsersSchema),
  asyncHandler(getBannedUsersController),
);

router.get(
  "/:id",
  authorize("ADMIN"),
  validate(getUserByIdSchema),
  asyncHandler(getUserByIdController),
);

router.post(
  "/:id/ban",
  authorize("ADMIN"),
  validate(banUserSchema),
  asyncHandler(banUserController),
);

router.delete(
  "/:id/ban",
  authorize("ADMIN"),
  validate(banUserSchema),
  asyncHandler(unbanUserController),
);

export default router;
