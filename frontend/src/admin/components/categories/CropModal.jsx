import React, { useState, useCallback, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropUtils';

export default function CropModal({ src, aspect = 1, open, onClose, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preset, setPreset] = useState(aspect);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const dataUrl = await getCroppedImg(src, croppedAreaPixels, 'image/jpeg', 0.9);
      onComplete(dataUrl);
      onClose();
    } catch (e) {
      console.error('Crop failed', e);
    }
  };

  const zoomMin = 1;
  const zoomMax = 3;
  const zoomPct = Math.round(((zoom - zoomMin) / (zoomMax - zoomMin)) * 100);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-4xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Crop image</h3>
            <p className="text-xs text-gray-500">Adjust the crop area and zoom.</p>
          </div>
          <div className="flex items-center gap-2">
            <button              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-9 bg-gray-50 overflow-hidden relative" style={{ minHeight: 360 }}>
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={preset}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Zoom</label>
              {/* styled range: green filled portion, gray remainder, black thumb */}
              <>
                <style>{`
                  .crop-range { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px; }
                  .crop-range::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; }
                  .crop-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #000; border: 2px solid #fff; margin-top: -4px; box-shadow: 0 1px 2px rgba(0,0,0,0.3); }
                  .crop-range::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #000; border: 2px solid #fff; }
                `}</style>
                <input
                  type="range"
                  min={zoomMin}
                  max={zoomMax}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="crop-range w-full"
                  style={{ background: `linear-gradient(90deg, #00bf63 ${zoomPct}%, #e5e7eb ${zoomPct}%)` }}
                />
              </>
            </div>
              <div className="pt-2">
                <label className="text-xs text-gray-600 mb-1 block">Aspect ratio</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPreset(1)} className={`px-2 py-1 text-xs ${preset === 1 ? 'bg-gray-100 border-2' : 'bg-white'}`}>1:1</button>
                  <button type="button" onClick={() => setPreset(16/9)} className={`px-2 py-1 text-xs ${preset === 16/9 ? 'bg-gray-100 border-2' : 'bg-white'}`}>16:9</button>
                </div>
              </div>

            <div className="mt-auto flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border-2 border-black text-sm text-black font-medium">Cancel</button>
              <button type="button" onClick={handleSave} className="flex-1 px-3 py-2 bg-black text-white text-sm font-medium">Save crop</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
