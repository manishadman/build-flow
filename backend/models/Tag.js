import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

tagSchema.index({ project: 1, name: 1 }, { unique: true });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
