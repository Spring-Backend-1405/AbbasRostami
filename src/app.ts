import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import courseRoutes from "./modules/course/course.routes.js";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes.js";
import favoriteRoutes from "./modules/favorite/favorite.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import postRoutes from "./modules/post/post.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import walletRoutes from "./modules/wallet/wallet.routes.js";
const app = express();

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(helmet());

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: [
    "X-Total-Count",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
  ],
};

app.use(cors(corsOptions));

// const globalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 1000,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: "fail",
//     data: {
//       message:
//         "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
//     },
//   },
// });

// app.use(globalLimiter);

const swaggerOptions = {
  swaggerOptions: {
    filter: true,
    displayRequestDuration: true,
    persistAuthorization: true,
    docExpansion: "none",
  },
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerOptions),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    data: {
      message: `مسیر ${req.originalUrl} یافت نشد`,
    },
  });
});

app.use(errorHandler);

export default app;
