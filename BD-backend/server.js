// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import mongoose from "mongoose";
// // import connectDB from './config/db.js'; // Add .js extension
// // import donorRoutes from './routes/donorRoutes.js'; // Add .js extension

// // dotenv.config();

// // // Connect to MongoDB
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(cors({
// //   origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
// //   credentials: true
// // }));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Routes
// // app.get("/", (req, res) => {
// //   res.send("Backend Running Successfully");
// // });

// // app.use('/api/donors', donorRoutes);

// // // Health check route
// // app.get('/health', (req, res) => {
// //   res.json({ 
// //     status: 'OK', 
// //     message: 'Server is running',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // 404 handler
// // app.use((req, res) => {
// //   res.status(404).json({
// //     success: false,
// //     message: 'Route not found'
// //   });
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({
// //     success: false,
// //     message: 'Something went wrong!',
// //     error: process.env.NODE_ENV === 'development' ? err.message : undefined
// //   });
// // });

// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB connected"))
// //   .catch(err => console.error("❌ MongoDB error:", err));
// // const PORT = process.env.PORT || 5000;

// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// //   // console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// // });
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from './config/db.js';
// import donorRoutes from "./routes/donorRoutes.js";
// import authRoutes from './routes/authRoutes.js';
// import orgRoutes   from "./routes/orgRoutes.js";

// dotenv.config();
// console.log('✅ Dotenv loaded');
// console.log('🔑 MONGODB_URI exists:', !!process.env.MONGODB_URI);
// console.log('🔑 MONGODB_URI starts with:', process.env.MONGODB_URI?.substring(0, 20));
// console.log('🔑 EMAIL_USER exists:', !!process.env.EMAIL_USER);
// console.log('🔑 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
// // connect database
// connectDB();

// const app = express();

// // middleware
// app.use(cors());
// app.use(express.json());

// // routes
// // app.use("/api/donors", donorRoutes);
// app.use('/api/auth', authRoutes); 
// app.use("/api/org",   orgRoutes);
// app.use("/api/donor", donorRoutes);

// // test route
// app.get("/", (req, res) => {
//   res.send("Blood Donation API Running");
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/db.js';
import authRoutes  from './routes/authRoutes.js';
import orgRoutes   from "./routes/orgRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";   // ← ADD THIS

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/org',    orgRoutes);
app.use('/api/donor',  donorRoutes);
app.use('/api/search', searchRoutes);   // ← ADD THIS  (FindBlood uses /api/search/blood)

// test
app.get("/", (req, res) => res.send("Blood Donation API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));