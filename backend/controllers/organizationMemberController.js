import OrganizationMembership from "../models/OrganizationMembership.js";

// =========================
// ADD ORGANIZATION MEMBER
// =========================

export async function addOrganizationMember(req, res) {
  try {
    const { organizationId } = req.params;
    const { userId, role } = req.body;

    // OWNER is created when the organization is created.
    // It cannot be assigned through this endpoint.
    if (role === "OWNER") {
      return res.status(400).json({
        message: "OWNER role cannot be assigned through this endpoint",
      });
    }

    // Check whether the user is already a member.
    const existingMembership = await OrganizationMembership.findOne({
      user: userId,
      organization: organizationId,
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this organization",
      });
    }

    const membership = await OrganizationMembership.create({
      user: userId,
      organization: organizationId,
      role,
    });

    // Return user information instead of only the ObjectId.
    await membership.populate("user", "firstName lastName email");

    return res.status(201).json(membership);
  } catch (error) {
    console.error("ADD ORGANIZATION MEMBER ERROR:", error);

    // Backup protection against duplicate memberships.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User is already a member of this organization",
      });
    }

    return res.status(500).json({
      message: "Failed to add organization member",
    });
  }
}

// =========================
// GET ORGANIZATION MEMBERS
// =========================

export async function getOrganizationMembers(req, res) {
  try {
    const { organizationId } = req.params;

    const members = await OrganizationMembership.find({
      organization: organizationId,
    }).populate("user", "firstName lastName email");

    return res.status(200).json(members);
  } catch (error) {
    console.error("GET ORGANIZATION MEMBERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get organization members",
    });
  }
}

// =========================
// UPDATE ORGANIZATION MEMBER
// =========================

export async function updateOrganizationMember(req, res) {
  try {
    const { organizationId, userId } = req.params;
    const { role } = req.body;

    // Nobody can assign OWNER through this endpoint.
    if (role === "OWNER") {
      return res.status(400).json({
        message: "OWNER role cannot be assigned through this endpoint",
      });
    }

    // FIND FIRST.
    const membership = await OrganizationMembership.findOne({
      organization: organizationId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        message: "Organization membership not found",
      });
    }

    // CHECK BEFORE MODIFYING.
    if (membership.role === "OWNER") {
      return res.status(403).json({
        message: "Organization OWNER cannot be modified",
      });
    }

    // Only modify after all checks pass.
    membership.role = role;

    await membership.save();

    await membership.populate("user", "firstName lastName email");

    return res.status(200).json(membership);
  } catch (error) {
    console.error("UPDATE ORGANIZATION MEMBER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update organization member",
    });
  }
}

// =========================
// REMOVE ORGANIZATION MEMBER
// =========================

export async function removeOrganizationMember(req, res) {
  try {
    const { organizationId, userId } = req.params;

    // FIND FIRST.
    const membership = await OrganizationMembership.findOne({
      organization: organizationId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        message: "Organization membership not found",
      });
    }

    // CHECK BEFORE DELETING.
    if (membership.role === "OWNER") {
      return res.status(403).json({
        message: "Organization OWNER cannot be removed",
      });
    }

    // Delete only after all checks pass.
    await membership.deleteOne();

    return res.status(200).json({
      message: "Organization member removed successfully",
    });
  } catch (error) {
    console.error("REMOVE ORGANIZATION MEMBER ERROR:", error);

    return res.status(500).json({
      message: "Failed to remove organization member",
    });
  }
}
