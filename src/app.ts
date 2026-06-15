import express from "express";
import { rateLimit } from 'express-rate-limit';
import { logger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { swaggerSpec } from "./config/swagger.config.js";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet());

const corsOptions = {
  
     allowedOrigins : [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
  
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
};

app.use(cors(corsOptions));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'تعداد درخواست‌ های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
  }
});

app.use(globalLimiter);


const swaggerOptions = {
  swaggerOptions: {
    filter: true,
    displayRequestDuration: true,
    persistAuthorization: true,
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});


// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);


app.use(logger);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `مسیر ${req.originalUrl} یافت نشد`
  });
});

app.use(errorHandler);

export default app;