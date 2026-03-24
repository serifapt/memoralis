import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop as CropIcon } from "lucide-react";

interface LogoCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

function getCroppedCanvas(image: HTMLImageElement, crop: PixelCrop): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function LogoCropper({ open, imageSrc, onClose, onCropComplete }: LogoCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;
    const canvas = getCroppedCanvas(imgRef.current, completedCrop);
    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, "image/png", 1);
  }, [completedCrop, onCropComplete]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-primary" />
            Recortar Logótipo
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Proporção fixa 1:1 — ideal para avatares, cards e cabeçalhos.</p>
        </DialogHeader>

        <div className="flex justify-center bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recortar logótipo"
              className="max-h-[360px] w-auto"
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!completedCrop}>
            Confirmar Recorte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
