import { createClient, createServiceClient } from '@/lib/supabase'
import type { Client, Devis, Facture, Commande, Article, Service, Temoignage, Newsletter } from '@/types'

// ── CLIENTS ──────────────────────────────────────────────────
export const clientsService = {
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('site_clients').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Client[]
  },
  async create(payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createClient()
    const { data, error } = await sb.from('site_clients').insert(payload).select().single()
    if (error) throw error
    return data as Client
  },
  async update(id: string, payload: Partial<Client>) {
    const sb = createClient()
    const { data, error } = await sb.from('site_clients').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Client
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('site_clients').delete().eq('id', id)
    if (error) throw error
  },
}

// ── DEVIS ─────────────────────────────────────────────────────
export const devisService = {
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('devis').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Devis[]
  },
  async create(payload: Omit<Devis, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createServiceClient()
    const { data, error } = await sb.from('devis').insert(payload).select().single()
    if (error) throw error
    return data as Devis
  },
  async update(id: string, payload: Partial<Devis>) {
    const sb = createClient()
    const { data, error } = await sb.from('devis').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Devis
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('devis').delete().eq('id', id)
    if (error) throw error
  },
}

// ── FACTURES ──────────────────────────────────────────────────
export const facturesService = {
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('factures').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Facture[]
  },
  async create(payload: Omit<Facture, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createClient()
    const { data, error } = await sb.from('factures').insert(payload).select().single()
    if (error) throw error
    return data as Facture
  },
  async update(id: string, payload: Partial<Facture>) {
    const sb = createClient()
    const { data, error } = await sb.from('factures').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Facture
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('factures').delete().eq('id', id)
    if (error) throw error
  },
}

// ── COMMANDES ─────────────────────────────────────────────────
export const commandesService = {
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('commandes').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Commande[]
  },
  async create(payload: Omit<Commande, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createServiceClient()
    const { data, error } = await sb.from('commandes').insert(payload).select().single()
    if (error) throw error
    return data as Commande
  },
  async update(id: string, payload: Partial<Commande>) {
    const sb = createClient()
    const { data, error } = await sb.from('commandes').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Commande
  },
}

// ── ARTICLES ──────────────────────────────────────────────────
export const articlesService = {
  async getPublished(limit = 20) {
    const sb = createClient()
    const { data, error } = await sb.from('articles').select('*').eq('publie', true).order('date_pub', { ascending: false }).limit(limit)
    if (error) throw error
    return data as Article[]
  },
  async getBySlug(slug: string) {
    const sb = createClient()
    const { data, error } = await sb.from('articles').select('*').eq('slug', slug).eq('publie', true).single()
    if (error) return null
    return data as Article
  },
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('articles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Article[]
  },
  async create(payload: Omit<Article, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createClient()
    const { data, error } = await sb.from('articles').insert(payload).select().single()
    if (error) throw error
    return data as Article
  },
  async update(id: string, payload: Partial<Article>) {
    const sb = createClient()
    const { data, error } = await sb.from('articles').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Article
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('articles').delete().eq('id', id)
    if (error) throw error
  },
}

// ── SERVICES ──────────────────────────────────────────────────
export const servicesService = {
  async getActive(categorie?: string) {
    const sb = createClient()
    let q = sb.from('site_services').select('*').eq('actif', true).order('ordre')
    if (categorie) q = q.eq('categorie', categorie)
    const { data, error } = await q
    if (error) throw error
    return data as Service[]
  },
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('site_services').select('*').order('ordre')
    if (error) throw error
    return data as Service[]
  },
  async create(payload: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const sb = createClient()
    const { data, error } = await sb.from('site_services').insert(payload).select().single()
    if (error) throw error
    return data as Service
  },
  async update(id: string, payload: Partial<Service>) {
    const sb = createClient()
    const { data, error } = await sb.from('site_services').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Service
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('site_services').delete().eq('id', id)
    if (error) throw error
  },
}

// ── TEMOIGNAGES ───────────────────────────────────────────────
export const temoignagesService = {
  async getActive(limit = 10) {
    const sb = createClient()
    const { data, error } = await sb.from('temoignages').select('*').eq('actif', true).limit(limit)
    if (error) throw error
    return data as Temoignage[]
  },
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('temoignages').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data as Temoignage[]
  },
  async create(payload: Omit<Temoignage, 'id' | 'created_at'>) {
    const sb = createClient()
    const { data, error } = await sb.from('temoignages').insert(payload).select().single()
    if (error) throw error
    return data as Temoignage
  },
  async update(id: string, payload: Partial<Temoignage>) {
    const sb = createClient()
    const { data, error } = await sb.from('temoignages').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Temoignage
  },
  async delete(id: string) {
    const sb = createClient()
    const { error } = await sb.from('temoignages').delete().eq('id', id)
    if (error) throw error
  },
}

// ── NEWSLETTER ────────────────────────────────────────────────
export const newsletterService = {
  async subscribe(email: string) {
    const sb = createServiceClient()
    const { data, error } = await sb.from('newsletter').upsert({ email, actif: true }, { onConflict: 'email' }).select().single()
    if (error) throw error
    return data as Newsletter
  },
  async getAll() {
    const sb = createClient()
    const { data, error } = await sb.from('newsletter').select('*').order('date_inscription', { ascending: false })
    if (error) throw error
    return data as Newsletter[]
  },
  async unsubscribe(email: string) {
    const sb = createServiceClient()
    const { error } = await sb.from('newsletter').update({ actif: false }).eq('email', email)
    if (error) throw error
  },
}
