export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export const parsePagination = (
  query: PaginationQuery,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationResult => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || defaultLimit;

  if (page < 1) page = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  return {
    page,
    limit,
    total,
  };
};
