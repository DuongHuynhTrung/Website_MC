import * as bcrypt from 'bcrypt';

export class MyFunctions {
  static async generatePassword(
    length: number,
    useNumbers = true,
    useSpecialChars = true,
  ) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-_+=~`[]{}|;:,.<>?';

    let chars = lowercaseChars + uppercaseChars;
    if (useNumbers) chars += numberChars;
    if (useSpecialChars) chars += specialChars;

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    const salt = await bcrypt.genSalt();
    const passwordEncoded = await bcrypt.hash(password, salt);

    return { password, passwordEncoded };
  }
}
