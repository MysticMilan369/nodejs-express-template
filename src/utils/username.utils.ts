import { randomBytes } from 'crypto';
import { User } from '@/models';

// Generate a unique username based on a base username (typically from email)
export async function generateUsername(baseUsername: string): Promise<string> {
  // Clean up the base username - remove special chars and limit length
  const cleanUsername = baseUsername
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters
    .toLowerCase()
    .substring(0, 20); // Limit length

  // First try the clean username
  const existingUser = await User.findOne({ username: cleanUsername });
  if (!existingUser) {
    return cleanUsername;
  }

  // If username exists, add random suffix
  let uniqueUsername = `${cleanUsername}_${randomBytes(3).toString('hex')}`;
  let userExists = true;

  while (userExists) {
    // Check if this username exists
    const existingUser = await User.findOne({ username: uniqueUsername });

    if (existingUser) {
      // Generate a new username with random suffix
      const randomSuffix = randomBytes(3).toString('hex');
      uniqueUsername = `${cleanUsername}_${randomSuffix}`;
    } else {
      userExists = false;
    }
  }

  return uniqueUsername;
}
