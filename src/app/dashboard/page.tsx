export const runtime = 'edge';
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <main style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, width: "100%" }}>
      <DashboardLayout />
    </main>
  );
}
