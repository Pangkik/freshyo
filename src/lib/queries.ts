import { supabase } from '@/lib/supabase';
import { Item, PriceReport, Rating, Store } from '@/lib/types';

// Matches the categories seeded in supabase/seed.sql. Static because the
// catalog is admin-managed — no query needed.
export const CATEGORIES = ['canned goods', 'noodles', 'dairy', 'condiments', 'household'];

// The five rating dimensions — always shown as separate rows, never averaged
// together into one score.
export const RATING_DIMENSIONS = [
  { key: 'ambience', label: 'Ambience' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'ease_of_access', label: 'Ease of access' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location', label: 'Location' },
] as const;

export async function searchItems(q: string): Promise<Item[]> {
  // Commas/parens are PostgREST .or() syntax — strip them from user input.
  const safe = q.replace(/[,()]/g, ' ').trim();
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .or(`name.ilike.%${safe}%,name_hil.ilike.%${safe}%`)
    .limit(25);
  if (error) throw error;
  return data;
}

export async function listItemsByCategory(category: string): Promise<Item[]> {
  const { data, error } = await supabase.from('items').select('*').eq('category', category).order('name');
  if (error) throw error;
  return data;
}

export async function getItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from('items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type PriceReportWithStore = PriceReport & { stores: { name: string } };

export async function getItemPrices(itemId: string): Promise<PriceReportWithStore[]> {
  const { data, error } = await supabase
    .from('price_reports')
    .select('*, stores(name)')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as PriceReportWithStore[];
}

// ponytail: scans the 50 most recent reports and dedupes by item in JS
// instead of a DISTINCT ON query — fine at v1 report volume, move to an RPC
// if this list ever needs to skip past a busy day of duplicate reports.
export async function recentItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('price_reports')
    .select('item_id, items(*)')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  const seen = new Set<string>();
  const items: Item[] = [];
  for (const row of data as unknown as { item_id: string; items: Item }[]) {
    if (seen.has(row.item_id) || !row.items) continue;
    seen.add(row.item_id);
    items.push(row.items);
    if (items.length === 10) break;
  }
  return items;
}

export async function listStores(): Promise<Store[]> {
  const { data, error } = await supabase.from('stores').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function addStore(store: {
  name: string;
  lat: number;
  lng: number;
  address: string | null;
}): Promise<Store> {
  const { data, error } = await supabase.from('stores').insert(store).select().single();
  if (error) throw error;
  return data;
}

export async function getStore(id: string): Promise<Store | null> {
  const { data, error } = await supabase.from('stores').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type PriceReportWithItem = PriceReport & { items: { name: string; size_label: string | null; unit: string } };

export async function getStorePrices(storeId: string): Promise<PriceReportWithItem[]> {
  const { data, error } = await supabase
    .from('price_reports')
    .select('*, items(name, size_label, unit)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as PriceReportWithItem[];
}

// ponytail: returns every rating row for the store; per-dimension means are
// computed client-side. Fine at v1 rating volume, move to a SQL aggregate
// (avg(...) group by store_id) if a store ever collects hundreds of ratings.
export async function getStoreRatings(storeId: string): Promise<Rating[]> {
  const { data, error } = await supabase.from('ratings').select('*').eq('store_id', storeId);
  if (error) throw error;
  return data;
}

export async function upsertRating(rating: Omit<Rating, 'id' | 'created_at'>): Promise<Rating> {
  const { data, error } = await supabase
    .from('ratings')
    .upsert(rating, { onConflict: 'store_id,user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyRating(storeId: string, userId: string): Promise<Rating | null> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('store_id', storeId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function addPriceReport(report: {
  item_id: string;
  store_id: string;
  price: number;
  unit: string;
  note: string | null;
  reported_by: string;
}): Promise<PriceReport> {
  const { data, error } = await supabase.from('price_reports').insert(report).select().single();
  if (error) throw error;
  return data;
}
