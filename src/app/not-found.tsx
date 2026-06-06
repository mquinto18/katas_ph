export const runtime = 'edge';

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 8 }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 800, color: "#2E7D32", margin: 0 }}>404</h1>
      <p style={{ color: "#757575", margin: 0 }}>Page not found</p>
      <a href="/orders" style={{ color: "#2E7D32", fontWeight: 600, marginTop: 8 }}>Go to Orders</a>
    </div>
  );
}
