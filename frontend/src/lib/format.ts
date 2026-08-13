export function formatMoney(cents: number): string {
  return `LKR ${(cents / 100).toFixed(2)}`;
}

export function productImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  return path;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  OUT_OF_STOCK: "Out of Stock",
};

export function formatProductStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
