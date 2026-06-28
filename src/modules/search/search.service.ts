import { prisma } from "../../lib/prisma.js";
import { SearchQuery } from "./search.validator.js";

const getVisibleWhere = () => ({
  published: true,
  OR: [{ categoryId: null }, { category: { show: true } }],
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
              ...getVisibleWhere(),
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
              ...getVisibleWhere(),
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
