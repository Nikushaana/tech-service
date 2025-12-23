export function formatPhone(value: string) {
    return value
        .replace(/\D/g, "")
        .slice(0, 9)
        .replace(/(\d{3})(\d{0,3})(\d{0,3})/, "$1 $2 $3")
        .replace(/\s+/g, " ")
        .trim();
}