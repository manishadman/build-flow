import mongoose from "mongoose";

const organizationMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
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

organizationMembershipSchema.index(
  { user: 1, organization: 1 },
  { unique: true },
);

const OrganizationMembership = mongoose.model(
  "OrganizationMembership",
  organizationMembershipSchema,
);

export default OrganizationMembership;
