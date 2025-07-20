/**
 * Calculates the total area covered by furniture items
 * @param {Array} furniture - Array of furniture items
 * @returns {number} - Total area covered
 */
export const calculateAreaCoverage = (furniture) => {
    if (!furniture || furniture.length === 0) return 0;

    return furniture.reduce((totalArea, item) => {
        if (item.dimensions) {
            const { width, depth } = item.dimensions;
            const itemArea = width * depth;
            return totalArea + itemArea;
        }

        return totalArea + 0.25;
    }, 0);
};

/**
 * Checks if two furniture items overlap
 * @param {Object} item1 - First furniture item
 * @param {Object} item2 - Second furniture item
 * @returns {boolean} - True if items overlap
 */
export const checkFurnitureOverlap = (item1, item2) => {
    if (!item1.position || !item2.position || !item1.dimensions || !item2.dimensions) {
        return false;
    }

    const pos1 = item1.position;
    const pos2 = item2.position;

    const dim1 = item1.dimensions;
    const dim2 = item2.dimensions;

    const halfWidth1 = dim1.width / 2;
    const halfDepth1 = dim1.depth / 2;
    const halfWidth2 = dim2.width / 2;
    const halfDepth2 = dim2.depth / 2;

    const xOverlap =
        Math.abs(pos1.x - pos2.x) < (halfWidth1 + halfWidth2);

    const zOverlap =
        Math.abs(pos1.z - pos2.z) < (halfDepth1 + halfDepth2);

    return xOverlap && zOverlap;
};

/**
 * Calculates space efficiency metrics
 * @param {number} roomArea - Room area in square meters
 * @param {number} coveredArea - Area covered by furniture
 * @returns {Object} - Efficiency metrics with percentage and rating
 */
export const calculateSpaceEfficiency = (roomArea, coveredArea) => {
    if (roomArea <= 0) return { percentage: 0, rating: 'N/A' };

    const percentage = (coveredArea / roomArea) * 100;

    let rating;
    if (percentage < 15) {
        rating = 'Under-furnished';
    } else if (percentage < 25) {
        rating = 'Minimalist';
    } else if (percentage < 35) {
        rating = 'Comfortable';
    } else if (percentage < 45) {
        rating = 'Well-furnished';
    } else if (percentage < 60) {
        rating = 'Densely furnished';
    } else {
        rating = 'Overcrowded';
    }

    return {
        percentage,
        rating
    };
};

/**
 * Calculates remaining walking space in the room
 * @param {number} roomArea - Room area in square meters
 * @param {number} coveredArea - Area covered by furniture
 * @returns {number} - Walking space in square meters
 */
export const calculateWalkingSpace = (roomArea, coveredArea) => {
    return Math.max(0, roomArea - coveredArea);
};