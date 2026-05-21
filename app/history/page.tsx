import { redirect } from "next/navigation";

/** Legacy route — canonical journal is at /readings */
export default function HistoryRedirectPage() {
  redirect("/readings");
}
