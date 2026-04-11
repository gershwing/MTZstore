// admin/src/utils/downloadBlob.js
export async function downloadWithAuth(url, filename, opts = {}) {
  const token = localStorage.getItem("accessToken") || "";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    credentials: opts.credentials || "same-origin", // por si usas cookies
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download failed ${res.status} ${text}`.trim());
  }
  const blob = await res.blob();
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
