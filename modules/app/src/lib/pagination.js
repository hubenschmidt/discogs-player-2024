const parsePaging = (query, config) => {
    const defaultLimit = config.defaultLimit ?? 25;
    const maxLimit = config.maxLimit ?? 100;
    const defaultOrder = config.defaultOrder ?? 'DESC';

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limitRaw = parseInt(query.limit);
    const limit = Math.max(1, Math.min(limitRaw || defaultLimit, maxLimit));
    const offset = (page - 1) * limit;

    const order =
        query.order?.toUpperCase() === 'ASC'
            ? 'ASC'
            : defaultOrder;

    const orderByParam = query.orderBy ?? config.defaultOrderBy;
    const orderBy =
        config.allowedOrderBy[orderByParam] ?? config.defaultOrderBy;

    return { page, limit, offset, order, orderBy };
};

const toPagedResponse = (count, page, limit, rows) => {
    return {
        count: count,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        items: rows,
    };
};

module.exports = { parsePaging, toPagedResponse };
