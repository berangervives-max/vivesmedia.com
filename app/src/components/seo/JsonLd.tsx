// Injecte un bloc JSON-LD (Schema.org) dans le DOM. Server component.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON sérialisé — sûr car données statiques internes (pas d'input utilisateur)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
