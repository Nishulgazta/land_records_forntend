import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, appearance, map defaults and data-mode preferences.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
