/**
 * Crops an image to a 3:4 aspect ratio (Standard ID Photo).
 * It attempts to center the crop based on the image center.
 */
export const cropTo3x4 = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Desired aspect ratio 3:4
      const aspectRatio = 3 / 4;
      
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let targetWidth, targetHeight;
      let offsetX = 0;
      let offsetY = 0;

      // Logic to find the largest 3:4 rectangle that fits in the image
      if (sourceWidth / sourceHeight > aspectRatio) {
        // Image is wider than 3:4
        targetHeight = sourceHeight;
        targetWidth = sourceHeight * aspectRatio;
        offsetX = (sourceWidth - targetWidth) / 2;
      } else {
        // Image is taller than 3:4 (or equal)
        targetWidth = sourceWidth;
        targetHeight = sourceWidth / aspectRatio;
        offsetY = (sourceHeight - targetHeight) / 2;
      }

      // Set canvas size (we can keep high res)
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw cropped image
      ctx.drawImage(
        img,
        offsetX, offsetY, targetWidth, targetHeight, // Source
        0, 0, targetWidth, targetHeight // Destination
      );

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
};

export const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              // Limit max size to avoid token limits or huge payloads
              const MAX_WIDTH = 1024;
              const scaleSize = MAX_WIDTH / img.width;
              if (scaleSize < 1) {
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scaleSize;
              } else {
                  canvas.width = img.width;
                  canvas.height = img.height;
              }
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
          }
          img.onerror = reject;
      }
      reader.onerror = reject;
    })
}