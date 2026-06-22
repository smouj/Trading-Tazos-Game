// /battle/prototype → /battle/practice (Arena Slam v2 is now the main practice mode)
import { redirect } from "next/navigation"

export default function PrototypePage() {
  redirect("/battle/practice")
}
