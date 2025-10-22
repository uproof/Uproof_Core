export type Project = {
  id: string;
  title: string;
  location: string;
  year: number;
  services: string[];
  description: string;
  image?: string;
};

export const projects: Project[] = [
  {
    id: 'valc-123',
    title: 'Staande-naad metalen dak – privātmāja',
    location: 'Rīga, Latvija',
    year: 2025,
    services: ['construction', 'profiling'],
    description:
      'Pilna cikla jumta būvniecība ar valcprofila segumu: konstrukcijas, siltināšana un seguma montāža.',
    image: '/images/projects/project-1.svg'
  },
  {
    id: 'paint-456',
    title: 'Jumta krāsošana – daudzdzīvokļu nams',
    location: 'Jelgava, Latvija',
    year: 2024,
    services: ['painting', 'maintenance'],
    description:
      'Jumta mehāniskā tīrīšana, grunts un divkārtēja krāsošana ilgtermiņa noturībai.',
    image: '/images/projects/project-2.svg'
  },
  {
    id: 'maint-789',
    title: 'Jumta apkope un noteku tīrīšana',
    location: 'Sigulda, Latvija',
    year: 2025,
    services: ['maintenance'],
    description:
      'Sniega novākšana, bojājumu pārbaude un noteksistēmu tīrīšana drošai ekspluatācijai.',
    image: '/images/projects/project-3.svg'
  }
];
