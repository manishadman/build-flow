import Activity from "../models/Activity.js";

export async function logActivity({
  actor,
  action,
  entityType,
  entityId,
  project,
  details,
}) {
  return Activity.create({
    actor,
    action,
    entityType,
    entityId,
    project,
    details,
  });
}
