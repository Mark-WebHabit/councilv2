export function maskId(id: string | undefined) {
  if (!id) {
    return "Unknown"; // Provide a default value instead of returning undefined
  }
  if (id.length <= 6) return id;
  const firstPart = id.slice(0, 3);
  const lastPart = id.slice(-3);
  return `${firstPart}***${lastPart}`;
}
