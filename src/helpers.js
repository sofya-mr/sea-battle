export function newShips(){
    return [
        { shipLength: 3, isSunk: false, cellDamage: 0, coords: [] },
        { shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },
        { shipLength: 2, isSunk: false, cellDamage: 0, coords: [] },
        { shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },
        { shipLength: 1, isSunk: false, cellDamage: 0, coords: [] },
    ]
}

export const directions = [
    { x: 1, y: 0 }, // right
    { x: 0, y: 1 }, // bottom
];
