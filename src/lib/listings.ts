// Port 6000 is on browsers' unsafe-port blocklist (historically X11) and is
// silently refused by Chromium/Firefox, so the backend runs on 5000 instead.
export const API_BASE_URL = 'http://localhost:5000';

export interface PriceHistoryEntry {
  id: string;
  listingId: string;
  price: number | string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | string | null;
  type: 'SALE' | 'RENT';
  brand: string | null;
  modelName: string | null;
  year: number | null;
  color: string | null;
  fuel: string | null;
  gear: string | null;
  km: number | null;
  enginePower: number | null;
  engineCapacity: number | null;
  bodyType: string | null;
  photos: string[];
  videos?: string[];
  viewCount?: number;
  createdAt?: string;
  priceHistory?: PriceHistoryEntry[];
}

// Static fallback catalogue used whenever the backend cannot be reached,
// so the storefront still has something to show during local development.
export const FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'porsche-911-fallback',
    title: 'Porsche 911 Carrera 2017',
    description: 'Kusursuz kondisyonda, tüm bakımları zamanında yapılmış Porsche 911 Carrera. Eşsiz sürüş deneyimi ve lüks tasarımıyla yeni sahibini bekliyor.',
    price: 420000,
    type: 'SALE',
    brand: 'Porsche',
    modelName: '911 Carrera',
    year: 2017,
    color: 'Kırmızı',
    fuel: 'Benzin',
    gear: 'Otomatik',
    km: 35000,
    enginePower: 370,
    engineCapacity: 3000,
    bodyType: 'Coupe',
    photos: ['/uploads/images/porsche_911.jpg'],
  },
  {
    id: 'shelby-gt500-fallback',
    title: '2014 Ford Shelby GT500 Coupe',
    description: 'Amerikan kası efsanesi Ford Shelby GT500. Supercharged motor, şeritli özel tasarım ve yüksek performanslı sürüş dinamikleri.',
    price: 117000,
    type: 'SALE',
    brand: 'Ford',
    modelName: 'Shelby GT500',
    year: 2014,
    color: 'Mavi',
    fuel: 'Benzin',
    gear: 'Manuel',
    km: 35000,
    enginePower: 662,
    engineCapacity: 5800,
    bodyType: 'Coupe',
    photos: ['/uploads/images/shelby_gt500.jpg'],
  },
  {
    id: 'mclaren-f1-fallback',
    title: 'McLaren F1 Sports Car',
    description: 'Efsanevi hiper otomobil McLaren F1. Sadece sınırlı sayıda üretilmiş, koleksiyonluk değerde ve kusursuz kondisyonda.',
    price: 77000,
    type: 'SALE',
    brand: 'McLaren',
    modelName: 'F1',
    year: 1996,
    color: 'Gümüş',
    fuel: 'Benzin',
    gear: 'Manuel',
    km: 35000,
    enginePower: 618,
    engineCapacity: 6100,
    bodyType: 'Sports Car',
    photos: ['/uploads/images/mclaren_f1.jpg'],
  },
];

const LOCAL_LISTINGS_KEY = 'local_listings_cars';

// Listings created through the "Aracını Sat" form while the backend was
// unreachable are stashed here so they still show up across the site.
export function getLocalListings(): Listing[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findLocalListingById(id: string): Listing | undefined {
  return getLocalListings().find((l) => l.id === id);
}

const COMPARE_STORAGE_KEY = 'local_compare_cars';
export const MAX_COMPARE = 3;

// Shared compare-list storage so the selection made on the homepage, the
// catalogue page, or a listing's detail page all stay in sync and are all
// visible on the standalone /compare page.
export function getCompareList(): Listing[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCompareList(list: Listing[]): void {
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
}

export function findFallbackListingById(id: string): Listing | undefined {
  return FALLBACK_LISTINGS.find((l) => l.id === id);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Locally saved and fallback listings use synthetic ids (e.g. "local-172..."
// or "porsche-911-fallback") that don't exist in the backend, so any
// endpoint that requires a real listingId (chat, price alerts) must be
// hidden for them.
export function isRealListingId(id: string): boolean {
  return UUID_RE.test(id);
}

export function getImageUrl(photoPath: string | undefined): string {
  if (!photoPath) return '/images/hero_bg.jpg';
  if (photoPath.startsWith('/uploads/images/')) {
    const filename = photoPath.replace('/uploads/images/', '');
    return `/images/${filename}`;
  }
  return photoPath;
}

export function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined || price === '') return 'Fiyat Belirtilmemiş';
  const num = typeof price === 'number' ? price : Number(price);
  if (Number.isNaN(num)) return String(price);
  return `$${num.toLocaleString('tr-TR')}`;
}

// Fetches a single listing by id, transparently handling ids that only
// exist client-side (locally saved or static fallback listings) as well as
// real backend-persisted listings.
export async function fetchListingById(id: string): Promise<Listing | null> {
  const local = findLocalListingById(id);
  if (local) return local;

  const fallback = findFallbackListingById(id);
  if (fallback) return fallback;

  try {
    const res = await fetch(`${API_BASE_URL}/api/listings/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}
