import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}))
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY)
const BAD=/(\/\/|\.)(avignon|carpentras|orange|cavaillon|pertuis|apt|sorgues|bollene|valreas|monteux|lapalud|vaison|sault)\.fr|\.gouv\.fr|magasins-u|carrefour|leclerc|intermarche|auchan|facebook\.com|instagram\.com|tripadvisor|thefork|lafourchette|ubereats|deliveroo|just-?eat|pagesjaunes|google\.|booking\.com|yelp\.|linktr\.ee/i
const siteOf=n=>(n.match(/https?:\/\/[^\s·\]]+/)||[])[0]||''
let rows=[],from=0
while(true){const{data}=await sb.from('site_clients').select('id,email,telephone,notes').eq('statut','prospect').range(from,from+999);rows=rows.concat(data);if(data.length<1000)break;from+=1000}
const targets=rows.filter(r=>{const s=siteOf(r.notes||'');return s&&!BAD.test(s)&&!/\[enrich /.test(r.notes||'')})
const EMAIL=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/ig,TEL=/(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}/g
const fj=async u=>{try{const c=new AbortController();const t=setTimeout(()=>c.abort(),20000);const r=await fetch('https://r.jina.ai/'+u,{signal:c.signal});clearTimeout(t);return r.ok?await r.text():''}catch{return''}}
let m=0,tl=0,done=0
const run=async r=>{const b=siteOf(r.notes);let t=await fj(b);if(!/@/.test(t))t+='\n'+await fj(b.replace(/\/$/,'')+'/contact')
 const ml=[...new Set((t.match(EMAIL)||[]).filter(x=>!/\.(png|jpe?g|gif|svg|webp)$|sentry|wixpress|example|@2x/i.test(x)))]
 const te=[...new Set((t.match(TEL)||[]).map(x=>x.replace(/[\s.\-]/g,'')))]
 const p={},u=[];if(!r.email&&ml[0]){p.email=ml[0];m++;u.push('email:'+ml[0])}if(!r.telephone&&te[0]){p.telephone=te[0];tl++;u.push('tel:'+te[0])}
 p.notes=(r.notes||'')+`\n[enrich ${new Date().toISOString().slice(0,10)} · ${u.length?u.join(' · '):'rien'}]`
 await sb.from('site_clients').update(p).eq('id',r.id);done++}
for(let i=0;i<targets.length;i+=4){await Promise.all(targets.slice(i,i+4).map(run))}
fs.writeFileSync('scripts/_enrich_result.txt',`Enrichis:${done} | emails:${m} | tels:${tl}\n`)
