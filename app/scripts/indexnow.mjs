// Soumission IndexNow (Bing, Yandex… → alimente aussi ChatGPT Search).
// Lit le sitemap de prod et notifie toutes les URLs. Aucun secret requis :
// la clé est publique (public/8f2d92f1397298d6ce67e0f3459c6740.txt).
// Usage : node scripts/indexnow.mjs [url1 url2 ...]  (sans argument = tout le sitemap)
const KEY = '8f2d92f1397298d6ce67e0f3459c6740'
const HOST = 'vivesmedia.com'

let urlList = process.argv.slice(2)
if (!urlList.length) {
  const xml = await fetch(`https://${HOST}/sitemap.xml`).then(r => r.text())
  urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
const ok = res.status === 200 || res.status === 202
console.log(`${ok ? '✅' : '❌ ' + res.status} IndexNow — ${urlList.length} URL(s) soumise(s)`)
if (!ok) console.log('   →', (await res.text()).replace(/\s+/g, ' ').slice(0, 200))
