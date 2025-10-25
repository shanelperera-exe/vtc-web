// helper to create a cropped image dataURL from a source image and pixel crop
export async function getCroppedImg(imageSrc, pixelCrop, outputType = 'image/jpeg', quality = 0.92) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(pixelCrop.width));
  canvas.height = Math.max(1, Math.floor(pixelCrop.height));
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    Math.floor(pixelCrop.x),
    Math.floor(pixelCrop.y),
    Math.floor(pixelCrop.width),
    Math.floor(pixelCrop.height),
    0,
    0,
    canvas.width,
    canvas.height
  );

  const outType = outputType === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(outType, outType === 'image/png' ? 1 : quality);
}
