export const reorderReleases = (records, selectedIndex) => {
    const n = records.length;
    if (n < 2) return records;
    const middleIndex = Math.floor((n - 1) / 2);
    const newArr = new Array(n);
    newArr[middleIndex] = records[selectedIndex];

    // Fill to the right
    let newPos = middleIndex + 1;
    let oldPos = selectedIndex + 1;
    while (newPos < n) {
        newArr[newPos] = records[oldPos % n];
        newPos++;
        oldPos++;
    }

    // Fill to the left
    newPos = middleIndex - 1;
    oldPos = selectedIndex - 1;
    while (newPos >= 0) {
        newArr[newPos] = records[(oldPos + n) % n];
        newPos--;
        oldPos--;
    }

    return newArr;
};
