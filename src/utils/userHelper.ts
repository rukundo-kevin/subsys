export const generateId = (type: string) => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const paddedNumber = randomNumber.toString().padStart(6, '0');

  return type === 'student' ? `ST${paddedNumber}` : `LC${paddedNumber}`;
};

export const generateRandomPassword = () => {
  const length = 8;
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=~`[]{}|:;"<>,.?/';

  const allCharacters = uppercaseLetters + lowercaseLetters + numbers + symbols;

  let password = '';

  while (password.length < length) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters[randomIndex];
  }

  return password;
};
