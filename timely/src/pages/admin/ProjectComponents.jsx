// This page was redesigned around the Domain > Work Package > Task >
// Subtask hierarchy (see src/pages/admin/project-work). The file is
// kept at this path/name so the existing route in App.jsx
// (`/admin/project/:id/components`) and its default import continue
// to work unchanged.
import ProjectWork from "./project-work/ProjectWork";

export default function ProjectComponents() {
  return <ProjectWork />;
}
