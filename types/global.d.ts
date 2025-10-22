// Type declarations for module imports

// Allow CSS module imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow importing CSS files as side effects
declare module '../app/globals.css';
declare module './globals.css';

// Component type declarations
declare module './LanguageSwitcher' {
  import { FC } from 'react';
  const LanguageSwitcher: FC;
  export default LanguageSwitcher;
}

// SVG imports
declare module '*.svg' {
  const content: string;
  export default content;
}

// Image imports
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
