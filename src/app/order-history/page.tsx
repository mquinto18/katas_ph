export const runtime = 'edge';
import OrderHistoryLayout from "@/components/OrderHistoryLayout";

export default function OrderHistoryPage() {
  return (
    <main style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, width: "100%" }}>
      <OrderHistoryLayout />
    </main>
  );
}
