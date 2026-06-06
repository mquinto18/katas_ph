export const runtime = 'edge';
import SettingsLayout from "@/components/SettingsLayout";

export default function SettingsPage() {
  return (
    <main style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0, width: "100%" }}>
      <SettingsLayout />
    </main>
  );
}
