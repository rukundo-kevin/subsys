export const generateAssignmentCode = () => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const paddedNumber = randomNumber.toString().padStart(6, '0');

  return `ASS${paddedNumber}`;
};

export const validateZipfile = (filename: string) => {
  const extension = filename.split('.')[1];
  const zipFileExtensions = ['zip', 'zipx', 'rar', '7z', 'gz', 'tar.gz', 'tar'];
  if (zipFileExtensions.includes(extension)) {
    return true;
  }
  return false;
};
