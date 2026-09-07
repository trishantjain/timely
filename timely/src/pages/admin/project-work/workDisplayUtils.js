// ==========================================
// SMALL PRESENTATION HELPERS SHARED ACROSS
// THE PROJECT WORK COMPONENT TREE
// ==========================================

export const getTaskStatusClass = (status) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "border-green-200 bg-green-50 text-green-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "UNDER_REVIEW":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "SUBMITTED":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export const formatDeadline = (date) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getSubmissionId = (task) => {
  if (!task) return "";

  if (typeof task.submissionId === "object") {
    return task.submissionId?._id || task.submissionId?.id || "";
  }

  return (
    task.submissionId ||
    task.submission?._id ||
    task.submission?.id ||
    task.submission ||
    ""
  );
};

// A ComponentTemplate ("Work Package" definition) is considered part
// of a domain if the ProjectModule it belongs to is tagged with that
// domain. Grouping happens client-side purely from data the backend
// already returns (template.projectModule.domain) — nothing hardcoded.
export const templateBelongsToDomain = (template, domainId) => {
  if (!domainId) return false;

  const templateDomainId =
    template?.projectModule?.domain?._id || template?.projectModule?.domain;

  return templateDomainId && templateDomainId.toString() === domainId.toString();
};

// A project's Work Package (ProjectComponent) belongs to a domain via
// the resolvedDomainId the backend already computes for us.
export const componentBelongsToDomain = (component, domainId) => {
  if (!domainId) return false;

  return (
    component?.resolvedDomainId &&
    component.resolvedDomainId.toString() === domainId.toString()
  );
};
