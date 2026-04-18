"use client";

import * as React from "react";

interface ProjectDialogsContextValue {
  openCreateProjectDialog: () => void;
  openRenameProject: (project: { id: string; name: string; description?: string }) => void;
  openDeleteProject: (project: { id: string; name: string }) => void;
}

const ProjectDialogsContext = React.createContext<ProjectDialogsContextValue | null>(null);

export function CreateProjectDialogProvider({
  children,
  onOpenCreateProject,
  onOpenRenameProject,
  onOpenDeleteProject,
}: {
  children: React.ReactNode;
  onOpenCreateProject: () => void;
  onOpenRenameProject: (project: { id: string; name: string; description?: string }) => void;
  onOpenDeleteProject: (project: { id: string; name: string }) => void;
}) {
  const value = React.useMemo(() => ({
    openCreateProjectDialog: onOpenCreateProject,
    openRenameProject: onOpenRenameProject,
    openDeleteProject: onOpenDeleteProject,
  }), [onOpenCreateProject, onOpenRenameProject, onOpenDeleteProject]);

  return (
    <ProjectDialogsContext.Provider value={value}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogs(): ProjectDialogsContextValue {
  const context = React.useContext(ProjectDialogsContext);
  if (!context) {
    return {
      openCreateProjectDialog: () => {},
      openRenameProject: () => {},
      openDeleteProject: () => {},
    };
  }
  return context;
}
