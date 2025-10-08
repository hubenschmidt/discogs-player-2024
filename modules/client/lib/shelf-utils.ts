// Where the visual "center" sits for an array of length n
export const centerPos = (n: number) => Math.floor((n - 1) / 2);

// Rotate array left by `delta` (negative = right). Returns same array if no-op.
export function rotateBy<T>(arr: readonly T[], delta: number): T[] {
    const n = arr.length;
    if (n === 0) return [];
    const k = ((delta % n) + n) % n; // normalize to [0, n)
    if (k === 0) return arr as T[]; // no churn
    return [...arr.slice(k), ...arr.slice(0, k)];
}

// Put the item at `index` into the center
export function centerOnIndex<T>(arr: readonly T[], index: number): T[] {
    const n = arr.length;
    if (n === 0) return [];
    const mid = centerPos(n);
    if (index === mid) return; // avoid churn
    return rotateBy(arr, centerPos(n) - index);
}

// Put the first match into the center (no change if not found)
export function centerOnMatch<T>(
    arr: readonly T[],
    match: (t: T) => boolean,
): T[] {
    const idx = arr.findIndex(match);
    if (idx === -1) return arr as T[];
    return centerOnIndex(arr, idx);
}

// Move the "center" cursor by delta (±1 for prev/next)
export function stepFromCenter<T>(arr: readonly T[], delta: number): T[] {
    const n = arr.length;
    if (n < 2) return arr as T[];
    const mid = centerPos(n);
    const nextIndex = (mid + delta + n) % n;
    return centerOnIndex(arr, nextIndex);
}

export const prevFromCenter = <T>(arr: readonly T[]) => stepFromCenter(arr, -1);
export const nextFromCenter = <T>(arr: readonly T[]) => stepFromCenter(arr, +1);
