import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crop as CropIcon, Square, RectangleHorizontal, Monitor } from "lucide-react";

interface LogoCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

const ASPECT_OPTIONS = [
  { label: "Livre", value: undefined, icon: CropIcon, hint: "Recorte personalizado" },
  { label: "1:1", value: 1, icon: Square, hint: "Cards e avatares" },
  { label: "3:1", value: 3, icon: RectangleHorizontal, hint: "Cabeçalho PDF e navegação" },
  { label: "16:9", value: 16 / 9, icon: Monitor, hint: "Página pública e capas" },
];

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

export function LogoCropper({ open, imageSrc, onClose, onCropComplete }: LogoCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleAspectChange = (aspect: number | undefined) => {
    setSelectedAspect(aspect);
    if (aspect && imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop: Crop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
      // Calculate centered crop with the given aspect
      const imgAspect = width / height;
      if (imgAspect > aspect) {
        const cropWidth = (aspect / imgAspect) * 100;
        newCrop.width = cropWidth;
        newCrop.x = (100 - cropWidth) / 2;
      } else {
        const cropHeight = (imgAspect / aspect) * 100;
        newCrop.height = cropHeight;
        newCrop.y = (100 - cropHeight) / 2;
      }
      setCrop(newCrop);
    } else {
      setCrop(undefined);
    }
  };

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
        </DialogHeader>

        {/* Aspect ratio buttons */}
        <div className="flex flex-wrap gap-2">
          {ASPECT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = selectedAspect === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => handleAspectChange(opt.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{opt.label}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {opt.hint}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Crop area */}
        <div className="flex justify-center bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={selectedAspect}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Recortar logótipo"
              className="max-h-[360px] w-auto"
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
