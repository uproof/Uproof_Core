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
    id: 'jelgava-001',
    titleKey: 'projects.items.fullCycleConstruction.title',
    locationKey: 'projects.items.fullCycleConstruction.location',
    year: 2025,
    services: ['construction', 'profiling', 'insulation'],
    descriptionKey: 'projects.items.fullCycleConstruction.description',
    image: '/images/projects/project-1.webp'
  },
  {
    id: 'renovation-002',
    titleKey: 'projects.items.renovationMetalRoof.title',
    locationKey: 'projects.items.renovationMetalRoof.location',
    year: 2025,
    services: ['renovation', 'profiling'],
    descriptionKey: 'projects.items.renovationMetalRoof.description',
    image: '/images/projects/project-2.webp'
  },
  {
    id: 'ridge-003',
    titleKey: 'projects.items.ventilatedRidge.title',
    locationKey: 'projects.items.ventilatedRidge.location',
    year: 2025,
    services: ['profiling', 'maintenance'],
    descriptionKey: 'projects.items.ventilatedRidge.description',
    image: '/images/projects/project-3.webp'
  },
  {
    id: 'replacement-004',
    titleKey: 'projects.items.roofReplacement.title',
    locationKey: 'projects.items.roofReplacement.location',
    year: 2025,
    services: ['renovation', 'profiling'],
    descriptionKey: 'projects.items.roofReplacement.description',
    image: '/images/projects/project-4.webp'
  },
  {
    id: 'tiles-005',
    titleKey: 'projects.items.tiledRoof.title',
    locationKey: 'projects.items.tiledRoof.location',
    year: 2025,
    services: ['construction', 'profiling'],
    descriptionKey: 'projects.items.tiledRoof.description',
    image: '/images/projects/project-5.webp'
  },
  {
    id: 'skylight-006',
    titleKey: 'projects.items.skylightInstallation.title',
    locationKey: 'projects.items.skylightInstallation.location',
    year: 2025,
    services: ['profiling', 'maintenance'],
    descriptionKey: 'projects.items.skylightInstallation.description',
    image: '/images/projects/project-6.webp'
  },
  {
    id: 'cathedral-007',
    titleKey: 'projects.items.cathedralPainting.title',
    locationKey: 'projects.items.cathedralPainting.location',
    year: 2024,
    services: ['painting'],
    descriptionKey: 'projects.items.cathedralPainting.description',
    image: '/images/projects/project-7.webp'
  },
  {
    id: 'grizinkalni-008',
    titleKey: 'projects.items.apartmentPainting.title',
    locationKey: 'projects.items.apartmentPainting.location',
    year: 2025,
    services: ['painting'],
    descriptionKey: 'projects.items.apartmentPainting.description',
    image: '/images/projects/project-8.webp'
  },
  {
    id: 'baldone-009',
    titleKey: 'projects.items.privatePainting.title',
    locationKey: 'projects.items.privatePainting.location',
    year: 2024,
    services: ['painting'],
    descriptionKey: 'projects.items.privatePainting.description',
    image: '/images/projects/project-9.webp'
  },
  {
    id: 'carnikava-010',
    titleKey: 'projects.items.galvanizedProfilingFacade.title',
    locationKey: 'projects.items.galvanizedProfilingFacade.location',
    year: 2025,
    services: ['profiling', 'renovation'],
    descriptionKey: 'projects.items.galvanizedProfilingFacade.description',
    image: '/images/projects/project-10.webp'
  },
  {
    id: 'riga-011',
    titleKey: 'projects.items.rigaPainting.title',
    locationKey: 'projects.items.rigaPainting.location',
    year: 2024,
    services: ['painting'],
    descriptionKey: 'projects.items.rigaPainting.description',
    image: '/images/projects/project-11.webp'
  }
];
