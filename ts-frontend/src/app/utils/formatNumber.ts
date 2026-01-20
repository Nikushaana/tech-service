export function formatNumber(value: number) {
  const formatted = value
    .toString()
    .replace(/[^0-9.]/g, "")       // keep only digits and dot
    .replace(/^0+(?=\d)/, "")      // remove leading zeros
    .replace(/(\..*?)\..*/g, "$1") // allow only one dot
    .replace(/(\.\d{0,2}).*/g, "$1") // max 2 digits after dot
    .replace(/^\./, "0.");         // if starts with dot, add leading 0

  return parseFloat(formatted) || 0; // convert to number, fallback 0
}