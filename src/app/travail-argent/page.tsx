import { redirect } from "next/navigation";

export default function TravailArgentRedirect() {
  redirect("/aides?search=emploi");
}
