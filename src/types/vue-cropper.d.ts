declare module 'vue-cropper' {
  import type { DefineComponent } from 'vue';

  export interface VueCropperMethods {
    rotateLeft(): void;
    rotateRight(): void;
    changeScale(scale: number): void;
    getCropData(callback: (data: string) => void): void;
    getCropBlob(callback: (blob: Blob) => void): void;
    startCrop(): void;
    stopCrop(): void;
    clearCrop(): void;
    getImgAxis(): any;
    getCropAxis(): any;
    goAutoCrop(): void;
  }

  export interface VueCropperProps {
    img?: string | ArrayBuffer | null;
    outputSize?: number;
    outputType?: string;
    info?: boolean;
    canScale?: boolean;
    autoCrop?: boolean;
    autoCropWidth?: number;
    autoCropHeight?: number;
    fixed?: boolean;
    fixedNumber?: [number, number];
    full?: boolean;
    fixedBox?: boolean;
    canMove?: boolean;
    canMoveBox?: boolean;
    original?: boolean;
    centerBox?: boolean;
    high?: boolean;
    infoTrue?: boolean;
    maxImgSize?: number;
    enlarge?: number;
    mode?: string;
  }

  export interface VueCropperEvents {
    onRealTime?: (data: any) => void;
    onImgMoving?: (data: any) => void;
    onCropMoving?: (data: any) => void;
    onImgLoad?: (result: string) => void;
  }

  export const VueCropper: DefineComponent<VueCropperProps & VueCropperEvents, unknown, unknown, unknown, VueCropperMethods>;
  export default VueCropper;
}
