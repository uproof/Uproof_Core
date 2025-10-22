export type Project = {
  id: string;
  titleKey: string;
  locationKey: string;
  year: number;
  services: string[];
  descriptionKey: string;
  image?: string;
};

export const projects: Project[] = [
  {
    id: 'valc-123',
    titleKey: 'projects.items.metalRoof.title',
    locationKey: 'projects.items.metalRoof.location',
    year: 2025,
    services: ['construction', 'profiling'],
    descriptionKey: 'projects.items.metalRoof.description',
    image: '/images/projects/project-1.svg'
  },
  {
    id: 'paint-456',
    titleKey: 'projects.items.roofPainting.title',
    locationKey: 'projects.items.roofPainting.location',
    year: 2024,
    services: ['painting', 'maintenance'],
    descriptionKey: 'projects.items.roofPainting.description',
    image: '/images/projects/project-2.svg'
  },
  {
    id: 'maint-789',
    titleKey: 'projects.items.roofMaintenance.title',
    locationKey: 'projects.items.roofMaintenance.location',
    year: 2025,
    services: ['maintenance'],
    descriptionKey: 'projects.items.roofMaintenance.description',
    image: '/images/projects/project-3.svg'
  }
];
