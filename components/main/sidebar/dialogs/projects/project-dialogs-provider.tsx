"use client";

import * as React from "react";
import CreateProjectDialog from "./create-project";
import RenameProjectModal from "./rename-project";
import DeleteProjectModal from "./delete-project";
import { CreateProjectDialogProvider } from "./create-project-context";

interface ProjectDialogsProviderProps {
  children: React.ReactNode;
}

export function ProjectDialogsProvider({ children }: ProjectDialogsProviderProps) {
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);
  const [renameProjectOpen, setRenameProjectOpen] = React.useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);

  const openCreateProject = React.useCallback(() => {
    setCreateProjectOpen(true);
  }, []);

  const openRenameProject = React.useCallback(
    (project: { id: string; name: string; description?: string }) => {
      setSelectedProject(project);
      setRenameProjectOpen(true);
    },
    [],
  );

  const openDeleteProject = React.useCallback(
    (project: { id: string; name: string }) => {
      setSelectedProject(project);
      setDeleteProjectOpen(true);
    },
    [],
  );

  return (
    <CreateProjectDialogProvider
        onOpenCreateProject={openCreateProject}
        onOpenRenameProject={openRenameProject}
        onOpenDeleteProject={openDeleteProject}
      >
        {children}
        <CreateProjectDialog
          open={createProjectOpen}
          onClose={setCreateProjectOpen}
        />
        <RenameProjectModal
          open={renameProjectOpen}
          onClose={setRenameProjectOpen}
          project={selectedProject}
        />
        <DeleteProjectModal
          open={deleteProjectOpen}
          onClose={setDeleteProjectOpen}
          project={selectedProject}
        />
      </CreateProjectDialogProvider>
  );
}
