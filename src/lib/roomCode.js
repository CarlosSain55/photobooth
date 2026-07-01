export function generateCode() {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 4; i++) s += letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(100 + Math.random() * 899);
  return s + '-' + num;
}
