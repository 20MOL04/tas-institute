import { redirect } from "next/navigation";

/** Les administrateurs sont désormais gérés dans « Équipe ». */
export default function CeoAdminsRedirect() {
  redirect("/os/ceo/team");
}
