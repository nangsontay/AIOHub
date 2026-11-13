/* A line is read from the edge toward which the tiles move. */
function slideLine(line) {
  const occupied = line.filter(Boolean), result = [];
  let gained = 0;
  for (let i = 0; i < occupied.length; i++) {
    let value = occupied[i];
    if (value === occupied[i + 1]) { value *= 2; gained += value; i++; }
    result.push(value);
  }
  return {values: result.concat(Array(4 - result.length).fill(0)), gained};
}
function moveBoard(board, direction) {
  const next = [...board];
  let gained = 0;
  for (let line = 0; line < 4; line++) {
    const indices = Array.from({length: 4}, (_, n) => {
      const pos = ['right', 'down'].includes(direction) ? 3 - n : n;
      return ['up', 'down'].includes(direction) ? pos * 4 + line : line * 4 + pos;
    });
    const moved = slideLine(indices.map(i => board[i]));
    gained += moved.gained;
    indices.forEach((i, j) => { next[i] = moved.values[j]; });
  }
  return {board: next, gained, changed: next.some((v,i) => v !== board[i])};
}
function spawnTile(board) {
  const empty = board.map((v,i) => v ? -1 : i).filter(i => i >= 0);
  if (empty.length) board[empty[Math.floor(Math.random()*empty.length)]] = Math.random() < .9 ? 2 : 4;
}
function newBoard() {
  const board = Array(16).fill(0);
  spawnTile(board); spawnTile(board);
  return {board, score: 0};
}
