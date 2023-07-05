import { Role } from '@prisma/client';

export const generateId = (prefix: string) => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  const paddedNumber = randomNumber.toString().padStart(6, '0');

  return `${prefix}${paddedNumber}`;
};

export const generateRandomPassword = () => {
  const length = 8;
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=~`[]{}|:;<>,.?/';

  const getRandomCharacter = (characters: string): string =>
    characters[Math.floor(Math.random() * characters.length)];

  let password = '';

  password += getRandomCharacter(lowercaseLetters); // Add one lowercase letter
  password += getRandomCharacter(uppercaseLetters); // Add one uppercase letter
  password += getRandomCharacter(numbers); // Add one number
  password += getRandomCharacter(symbols); // Add one symbol

  while (password.length < length) {
    const characterGroup: string = getRandomCharacter(
      lowercaseLetters + uppercaseLetters + numbers + symbols
    );
    password += getRandomCharacter(characterGroup);
  }

  return password;
};

export const getRole = (username: string): Role | 'USER' => {
  if (username.includes('@') && username.indexOf('@') < username.lastIndexOf('.')) {
    return 'USER';
  } else if (username.startsWith('LC')) {
    return Role.LECTURER;
  } else {
    return Role.STUDENT;
  }
};
