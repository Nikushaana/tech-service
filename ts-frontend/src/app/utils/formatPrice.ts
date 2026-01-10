export function formatPrice(value: string) {
  if (value === "," || value === ".") return "0.";

  return value
    .replace(",", ".")              // convert comma to dot
    .replace(/[^0-9.]/g, "")       // keep only digits and dot
    .replace(/^0+(?=\d)/, "")      // remove leading zeros
    .replace(/(\..*?)\..*/g, "$1") // allow only one dot
    .replace(/(\.\d{0,2}).*/g, "$1") // max 2 digits after dot
    .replace(/^\./, "0.");         // if starts with dot, add leading 0
}