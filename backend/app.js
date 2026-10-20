import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "BuildFlow API is running",
  });
});

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", organizationRoutes);
app.use("/api", projectRoutes);
app.use("/api", commentRoutes);
app.use("/api", tagRoutes);
app.use("/api", userRoutes);
app.use("/api", activityRoutes);
app.use("/api", dashboardRoutes);

export default app;
