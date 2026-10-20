import mongoose from "mongoose";

const projectMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      default: "MEMBER",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

projectMembershipSchema.index({ user: 1, project: 1 }, { unique: true });

const ProjectMembership = mongoose.model(
  "ProjectMembership",
  projectMembershipSchema,
);

export default ProjectMembership;
