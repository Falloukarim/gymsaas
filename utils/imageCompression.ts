import Compressor from 'compressorjs';

export const compressImage = (file: File): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 1600,
      maxHeight: 1600,
      convertTypes: ['image/png', 'image/jpeg'],
      success: (result) => resolve(result as File),
      error: reject,
    });
  });
};
