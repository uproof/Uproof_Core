declare module 'vanta/dist/vanta.net.min' {
  interface VantaEffect {
    destroy: () => void;
    resize: () => void;
    setOptions: (options: VantaOptions) => void;
  }

  interface VantaOptions {
    el: HTMLElement | string;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number | string;
    backgroundColor?: number | string;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  }

  const NET: (opts: VantaOptions) => VantaEffect;
  export default NET;
}

declare module 'vanta/dist/vanta.waves.min' {
  interface VantaEffect {
    destroy: () => void;
    resize: () => void;
    setOptions: (options: VantaOptions) => void;
  }

  interface VantaOptions {
    el: HTMLElement | string;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number | string;
    shininess?: number;
    waveHeight?: number;
    waveSpeed?: number;
    zoom?: number;
  }

  const WAVES: (opts: VantaOptions) => VantaEffect;
  export default WAVES;
}

declare module 'vanta/dist/vanta.fog.min' {
  interface VantaEffect {
    destroy: () => void;
    resize: () => void;
    setOptions: (options: VantaOptions) => void;
  }

  interface VantaOptions {
    el: HTMLElement | string;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    highlightColor?: number | string;
    midtoneColor?: number | string;
    lowlightColor?: number | string;
    baseColor?: number | string;
    blurFactor?: number;
    speed?: number;
    zoom?: number;
  }

  const FOG: (opts: VantaOptions) => VantaEffect;
  export default FOG;
}
