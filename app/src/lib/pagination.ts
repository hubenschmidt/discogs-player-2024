import type { Request } from 'express';

export type OrderDir = 'ASC' | 'DESC';

export type PagingConfig = {
    defaultLimit?: number;
    maxLimit?: number;
    defaultOrderBy: string;
    allowedOrderBy: Record<string, string>;
    defaultOrder?: OrderDir;
};

export const parsePaging = (req: Request, config: PagingConfig) => {
    const defaultLimit = config.defaultLimit ?? 25;
    const maxLimit = config.maxLimit ?? 100;
    const defaultOrder = config.defaultOrder ?? 'DESC';

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limitRaw = parseInt(req.query.limit as string);
    const limit = Math.max(1, Math.min(limitRaw || defaultLimit, maxLimit));
    const offset = (page - 1) * limit;

    const order = (
        (req.query.order as string)?.toUpperCase() === 'ASC'
            ? 'ASC'
            : defaultOrder
    ) as OrderDir;

    const orderByParam = (req.query.orderBy as string) ?? config.defaultOrderBy;
    const orderBy =
        config.allowedOrderBy[orderByParam] ?? config.defaultOrderBy;

    return { page, limit, offset, order, orderBy };
};

export const toPagedResponse = <T>(
    count: number,
    page: number,
    limit: number,
    rows: T[],
) => {
    return {
        count: count,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        items: rows,
    };
};
