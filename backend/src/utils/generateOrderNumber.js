/**
 * Generate a unique order number in the format: ML-YYYY-XXXXX
 * ML = NearRun, YYYY = current year, XXXXX = random 5 digits
 */
export function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `ML-${year}-${random}`;
}
