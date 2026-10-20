import OrganizationMembership from "../models/OrganizationMembership.js";

export async function requireOrganizationMember(req, res, next) {
  try {
    const { organizationId } = req.params;

    const membership = await OrganizationMembership.findOne({
      user: req.user._id,
      organization: organizationId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this organization",
      });
    }

    req.organizationMembership = membership;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify organization access",
    });
  }
}

export function requireOrganizationRole(...allowedRoles) {
  return function (req, res, next) {
    const membership = req.organizationMembership;

    if (!membership || !allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}
