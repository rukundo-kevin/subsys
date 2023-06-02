export const generateAssignmentCode = () => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const paddedNumber = randomNumber.toString().padStart(6, '0');

  return `ASS${paddedNumber}`;
};
