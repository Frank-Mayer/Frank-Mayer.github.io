export function escapeHtml(unsafe: string): string {
    if (!unsafe) {
        return ""
    }

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}
