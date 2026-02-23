const formatDate = (val, locale = 'en-US', tz) => {
    if (!val) return '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    const opts = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Intl.DateTimeFormat(
        locale,
        tz ? { ...opts, timeZone: tz } : opts,
    ).format(d);
};

module.exports = { formatDate };
