export type ProjectProgressSource = 'crew-automation' | 'project-manager' | 'estimator-plan';

export type ProjectProgressSnapshot = {
  projectId: string;
  percent: number;
  phase: string;
  completedTasks: number;
  totalTasks: number;
  actualHours: number;
  updatedAt: string;
  source: ProjectProgressSource;
};

export function normalizeProjectProgress(value: unknown): ProjectProgressSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ProjectProgressSnapshot>;
  const percent = Number(candidate.percent);
  const completedTasks = Number(candidate.completedTasks);
  const totalTasks = Number(candidate.totalTasks);
  const actualHours = Number(candidate.actualHours);
  if (!candidate.projectId || !candidate.updatedAt || !Number.isFinite(percent)) return null;

  return {
    projectId: String(candidate.projectId),
    percent: Math.max(0, Math.min(100, percent)),
    phase: String(candidate.phase || ''),
    completedTasks: Number.isFinite(completedTasks) ? Math.max(0, completedTasks) : 0,
    totalTasks: Number.isFinite(totalTasks) ? Math.max(0, totalTasks) : 0,
    actualHours: Number.isFinite(actualHours) ? Math.max(0, actualHours) : 0,
    updatedAt: String(candidate.updatedAt),
    source: candidate.source === 'crew-automation' || candidate.source === 'project-manager' || candidate.source === 'estimator-plan'
      ? candidate.source
      : 'crew-automation',
  };
}
