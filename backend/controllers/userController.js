import User from "../models/User.js";

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get profile",
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const updates = {};

    if (req.body.firstName !== undefined) {
      updates.firstName = String(req.body.firstName).trim();

      if (!updates.firstName) {
        return res.status(400).json({
          message: "First name is required",
        });
      }
    }

    if (req.body.lastName !== undefined) {
      updates.lastName = String(req.body.lastName).trim();

      if (!updates.lastName) {
        return res.status(400).json({
          message: "Last name is required",
        });
      }
    }

    if (req.body.email !== undefined) {
      updates.email = String(req.body.email).trim().toLowerCase();

      if (!updates.email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(updates.email)) {
        return res.status(400).json({
          message: "Enter a valid email address",
        });
      }

      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
    }

    if (req.body.phone !== undefined) {
      updates.phone = String(req.body.phone).trim();

      if (updates.phone) {
        const digits = updates.phone.replace(/\D/g, "");
        const phonePattern = /^[0-9+().\-\s]+$/;

        if (
          !phonePattern.test(updates.phone) ||
          digits.length < 7 ||
          digits.length > 15
        ) {
          return res.status(400).json({
            message: "Enter a valid telephone number",
          });
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No profile fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
}
