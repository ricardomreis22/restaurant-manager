import prisma from "@/lib/prisma";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        restaurants: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        restaurants: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};
