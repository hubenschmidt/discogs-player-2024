export const formatDuration = (d?: string | number) => {
    if (d == null) return '—';
    const s = Number.parseInt(String(d), 10);
    if (!Number.isFinite(s)) return '—';
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
};
