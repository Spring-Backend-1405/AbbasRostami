import { prisma } from "../lib/prisma.js";

export const hasCourseAccess = async (
  userId: string,
  courseId: string,
): Promise<boolean> => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { id: true },
  });

  return !!enrollment;
};
