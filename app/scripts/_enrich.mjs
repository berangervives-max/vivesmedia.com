import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const env = Object.fromEntries(fs.readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()]}))
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BAD=/(\/\/|\.)(avignon|carpentras|orange|cavaillon|pertuis|apt|sorgues|bollene|valreas|monteux|lapalud|vaison|sault)\.fr|\.gouv\.fr|magasins-u|carrefour|leclerc|intermarche|auchan|facebook\.com|instagram\.com|tripadvisor|thefork|lafourchette|ubereats|deliveroo|just-?eat|pagesjaunes|google\.|booking\.com|yelp\.|linktr\.ee/i
const siteOf=n=>(n.match(/https?:\/\/[^\s·\]]+/)||[])[0]||''
let rows=[],from=0
while(true){const{data}=await sb.from('site_clients').select('id,nom,entreprise,email,telephone,notes').eq('statut','prospect').range(from,from+999);rows=rows.concat(data);if(data.length<1000)break;from+=1000}
const targets=rows.filter(r=>{const s=siteOf(r.notes||'');return s&&!BAD.test(s)&&!/\[enrich /.test(r.notes||'')})
console.log('Cibles (site valide, non enrichies):',targets.length)
const EMAIL=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/ig
const TEL=/(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}/g
const fetchJina=async u=>{try{const c=new AbortController();const t=setTimeout(()=>c.abort(),15000);const r=await fetch('https://r.jina.ai/'+u,{signal:c.signal});clearTimeout(t);return r.ok?await r.text():''}catch{return''}}
let gotMail=0,gotTel=0,done=0
const run=async r=>{
  const base=siteOf(r.notes); let txt=await fetchJina(base)
  if(!/@/.test(txt)){const c=await fetchJina(base.replace(/\/$/,'')+'/contact');txt+='\n'+c}
  const mails=[...new Set((txt.match(EMAIL)||[]).filter(m=>!/\.(png|jpg|jpeg|gif|svg|webp)$|sentry|wixpress|example|@sentry|@2x/i.test(m)))]
  const tels=[...new Set((txt.match(TEL)||[]).map(t=>t.replace(/[\s.\-]/g,'')))]
  const patch={}; const upd=[]
  if(!r.email&&mails[0]){patch.email=mails[0];gotMail++;upd.push('email:'+mails[0])}
  if(!r.telephone&&tels[0]){patch.telephone=tels[0];gotTel++;upd.push('tel:'+tels[0])}
  patch.notes=(r.notes||'')+`\n[enrich ${new Date().toISOString().slice(0,10)} · ${upd.length?upd.join(' · '):'rien trouvé'}]`
  await sb.from('site_clients').update(patch).eq('id',r.id); done++
}
// concurrence 4
for(let i=0;i<targets.length;i+=4){await Promise.all(targets.slice(i,i+4).map(run))}
console.log('Traités:',done,'| emails trouvés:',gotMail,'| téléphones trouvés:',gotTel)
