import { redirect } from 'next/navigation'

// L'URL nue /cms n'avait pas de page (404). On renvoie vers le tableau de bord ;
// la garde d'auth du layout redirige ensuite vers /cms/login si nécessaire.
export default function CmsIndex() {
  redirect('/cms/dashboard')
}
