import { prisma } from "../../lib/prisma.js";
import { SearchQuery } from "./search.validator.js";

const getVisibleCourseWhere = () => ({
  published: true,
  category: { show: true },
});

const getVisiblePostWhere = () => ({
  published: true,
  category: { show: true },
});

export const searchService = {
  async search(query: SearchQuery) {
    const { q, type } = query;
    const limit = Math.min(Number(query.limit) || 5, 20);

    const searchFilter = {
      contains: q,
      mode: "insensitive" as const,
    };

    const [courses, posts] = await Promise.all([
      !type || type === "course"
        ? prisma.course.findMany({
            where: {
              ...getVisibleCourseWhere(),
              AND: [
                {
                  OR: [{ title: searchFilter }, { description: searchFilter }],
                },
              ],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              imageUrl: true,
              price: true,
              level: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      !type || type === "post"
        ? prisma.post.findMany({
            where: {
              ...getVisiblePostWhere(),
              AND: [
                {
                  OR: [{ title: searchFilter }, { content: searchFilter }],
                },
              ],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            take: limit,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return {
      query: q,
      courses,
      posts,
    };
  },
};
