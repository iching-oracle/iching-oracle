import { permanentRedirect } from "next/navigation";

/** Canonical quick-reading URL is /reading/new */
export default function ReadingsNewRedirect() {
  permanentRedirect("/reading/new");
}
