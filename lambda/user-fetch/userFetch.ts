import { UserScanMessage } from '../../shared/sqs';
import { LocalsAPI } from '../../shared/locals';
import { createPrismaClient } from '../../shared/repositories/prisma';
import { UserRepository } from '../../shared/repositories/UserRepository';
import { config } from './config';

type PrismaError = Error & { code: string };

export function isDuplicateError(error: unknown) {
  const prismaError = error as PrismaError;
  if (prismaError && prismaError.code === 'P2002') {
    return true;
  }
  return false;
}

export const userFetch = async (message: UserScanMessage) => {
  try {
    const locals = new LocalsAPI(config.LOCALS_ACCESS_TOKEN);

    const prisma = createPrismaClient();
    const userRepository = new UserRepository(prisma);

    const [user, userPhotos] = await Promise.all([
      locals.getUser({ id: message.userId }),
      locals.getUserPhotos({ id: message.userId }),
    ]);

    const photos = userPhotos.map((photo) => ({
      id: photo.id,
      src: photo.image,
    }));

    const savedUser = await userRepository.createUser({
      localsId: `${user.id}`,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      age: user.age,
      gender: user.gender,
      description: user.description,
      occupation: user.occupation,
      country: user.country,
      city: user.city,
      height: parseInt(`${user.labels.height}`, 10) || undefined,
      shareLink: user.share_link,
      linkedinLink: user.linkedin_link,
      instagramUsername: user.instagram_username,
      avatarPicture: user.avatar_picture,
      photos,
    });

    console.log(`User ${user.id} "${user.first_name} ${user.last_name}" saved`);

    return savedUser;
  } catch (error: unknown) {
    if (isDuplicateError(error)) {
      console.log(`User ${message.userId} is already in the database`);
      return null;
    }
    console.error(`Error fetching user ${message.userId}:`, error);
    throw error;
  }
};
