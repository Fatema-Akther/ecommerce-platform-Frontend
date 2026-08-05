






export const DEFAULT_IMAGE = "/assets/placeholder.webp";

export const BANGLA_TO_LATIN: Record<string, string> = {
  "অ": "o",
  "আ": "a",
  "ই": "i",
  "ঈ": "i",
  "উ": "u",
  "ঊ": "u",
  "ঋ": "ri",
  "এ": "e",
  "ঐ": "oi",
  "ও": "o",
  "ঔ": "ou",
  "ক": "k",
  "খ": "kh",
  "গ": "g",
  "ঘ": "gh",
  "ঙ": "ng",
  "চ": "ch",
  "ছ": "chh",
  "জ": "j",
  "ঝ": "jh",
  "ঞ": "ny",
  "ট": "t",
  "ঠ": "th",
  "ড": "d",
  "ঢ": "dh",
  "ণ": "n",
  "ত": "t",
  "থ": "th",
  "দ": "d",
  "ধ": "dh",
  "ন": "n",
  "প": "p",
  "ফ": "ph",
  "ব": "b",
  "ভ": "bh",
  "ম": "m",
  "য": "j",
  "র": "r",
  "ল": "l",
  "শ": "sh",
  "ষ": "sh",
  "স": "s",
  "হ": "h",
  "ড়": "r",
  "ড়": "r",
  "ঢ়": "rh",
  "য়": "y",
  "য়": "y",
  "ৎ": "t",
  "ং": "ng",
  "ঃ": "h",
  "ঁ": "",
};

export const TERM_SYNONYMS: Record<string, string[]> = {
  shada: ["white", "সাদা"],
  white: ["shada", "সাদা"],
  kalo: ["black", "কালো"],
  black: ["kalo", "কালো"],

  shirt: ["shart", "শার্ট"],
  shart: ["shirt", "শার্ট"],
  "শার্ট": ["shirt", "shart"],

  tshirt: ["t-shirt", "tee", "টি-শার্ট", "গেঞ্জি"],
  "t-shirt": ["tshirt", "tee", "টি-শার্ট", "গেঞ্জি"],
  tee: ["tshirt", "t-shirt", "টি-শার্ট", "গেঞ্জি"],
  "টি-শার্ট": ["tshirt", "t-shirt", "tee", "গেঞ্জি"],

  panjabi: ["punjabi", "পাঞ্জাবি"],
  punjabi: ["panjabi", "পাঞ্জাবি"],
  "পাঞ্জাবি": ["panjabi", "punjabi"],

  mobile: ["phone", "smartphone", "মোবাইল", "ফোন"],
  phone: ["mobile", "smartphone", "মোবাইল", "ফোন"],
  smartphone: ["mobile", "phone", "মোবাইল", "ফোন"],
  "মোবাইল": ["mobile", "phone", "smartphone", "ফোন"],
  "ফোন": ["mobile", "phone", "smartphone", "মোবাইল"],

  shoe: ["shoes", "juta", "জুতা"],
  shoes: ["shoe", "juta", "জুতা"],
  juta: ["shoe", "shoes", "জুতা"],
  "জুতা": ["shoe", "shoes", "juta"],

  watch: ["ঘড়ি", "ঘড়ি"],
  "ঘড়ি": ["watch", "ঘড়ি"],
  "ঘড়ি": ["watch", "ঘড়ি"],
};

export type SearchableProduct = {
  id: string;
  _id?: string;
  name: string;
    image?: string | null;
  slug?: string;

  description?: string;
  short_description?: string;
  sku: string;
  isPublish: boolean;
  keywords?: string[];
  tags?: string[];
  soldCount?: number;
  viewCount?: number;
  featured?: boolean;
  categoryName?: string;
  categorySlug?: string;
  category_slug?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: Array<{
    _id: string; // Added _id field to match the Product type
    image: {
      secure_url: string;
      optimizeUrl: string;  // Added optimizeUrl field to match the Product type
      public_id: string;    // Added public_id field to match the Product type
    };
    alterImage?: {
      secure_url: string;
      optimizeUrl: string;
      public_id: string;
    };
  }>;
};

export type SearchableCategory = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  slug?: string;
  image?: {
    optimizeUrl?: string;
  };
  children?: SearchableCategory[];
};

export const normalizeText = (text: string = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’'"]/g, "");

export const transliterateBanglaToLatin = (text: string = "") =>
  text
    .split("")
    .map((char) => BANGLA_TO_LATIN[char] ?? char)
    .join("");

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[অ-হড়ঢ়য়য়ৎংঃঁড়]/g, (char) => BANGLA_TO_LATIN[char] || char)
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const getExpandedTerms = (query: string): string[] => {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const transliterated = normalizeText(transliterateBanglaToLatin(normalized));

  const seed = new Set<string>();
  seed.add(normalized);
  seed.add(transliterated);

  normalized.split(" ").forEach((word) => word && seed.add(word));
  transliterated.split(" ").forEach((word) => word && seed.add(word));

  const all = new Set<string>(seed);

  Array.from(seed).forEach((term) => {
    const synonyms = TERM_SYNONYMS[term] || [];
    synonyms.forEach((s) => all.add(normalizeText(s)));
  });

  return Array.from(all).filter(Boolean);
};

export const levenshteinDistance = (a: string, b: string) => {
  const s = normalizeText(a);
  const t = normalizeText(b);

  if (!s) return t.length;
  if (!t) return s.length;

  const dp = Array.from({ length: s.length + 1 }, () =>
    Array(t.length + 1).fill(0)
  );

  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[s.length][t.length];
};

export const isTypoMatch = (query: string, candidate: string) => {
  const q = normalizeText(query);
  const c = normalizeText(candidate);

  if (!q || !c) return false;

  const threshold = q.length <= 4 ? 1 : q.length <= 8 ? 2 : 3;
  return levenshteinDistance(q, c) <= threshold;
};

export const getPopularScore = (product: SearchableProduct) => {
  const sold = typeof product.soldCount === "number" ? product.soldCount : 0;
  const views = typeof product.viewCount === "number" ? product.viewCount : 0;
  const featured = product.featured ? 8 : 0;

  return Math.min(
    20,
    Math.floor(sold / 10) + Math.floor(views / 100) + featured
  );
};

export const getProductId = (product: SearchableProduct) =>
  product.id || product._id || "";

export const getProductCategorySlug = (product: SearchableProduct) => {
  return (
    product.categorySlug ||
    product.category?.slug ||
    product.category_slug ||
    ""
  );
};




export const getProductImage = (
  product: SearchableProduct
): string => {

  if (product.image) {
    return product.image;
  }

  const firstImage = product.images?.[0];

  const secureUrl =
    firstImage?.alterImage?.secure_url ||
    firstImage?.image?.secure_url;

  if (!secureUrl) {
    return DEFAULT_IMAGE;
  }

  return secureUrl;
};


export const getCategoryImage = (category: SearchableCategory): string => {
  if (category?.image?.optimizeUrl) return category.image.optimizeUrl;
  const sub = category?.children?.find((c) => c?.image?.optimizeUrl);
  return sub?.image?.optimizeUrl || DEFAULT_IMAGE;
};

export const getSearchBlob = (product: SearchableProduct) => {
  const name = normalizeText(product.name || "");
  const desc = normalizeText(product.description || "");
  const shortDesc = normalizeText(product.short_description || "");
  const keywords = normalizeText((product.keywords || []).join(" "));
  const tags = normalizeText((product.tags || []).join(" "));
  const categoryName = normalizeText(
    product.categoryName || product.category?.name || ""
  );
  const latinName = normalizeText(transliterateBanglaToLatin(product.name || ""));

  return [name, latinName, desc, shortDesc, keywords, tags, categoryName]
    .filter(Boolean)
    .join(" ");
};

export const scoreProduct = (product: SearchableProduct, query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const expandedTerms = getExpandedTerms(normalizedQuery);
  const name = normalizeText(product.name || "");
  const latinName = normalizeText(transliterateBanglaToLatin(product.name || ""));
  const blob = getSearchBlob(product);

  let score = 0;

  if (name === normalizedQuery || latinName === normalizedQuery) score += 120;
  if (name.startsWith(normalizedQuery) || latinName.startsWith(normalizedQuery)) score += 90;
  if (name.includes(normalizedQuery) || latinName.includes(normalizedQuery)) score += 70;

  const nameWords = name.split(" ").filter(Boolean);
  if (nameWords.some((word) => word.startsWith(normalizedQuery))) score += 40;

  let matchedTerms = 0;
  expandedTerms.forEach((term) => {
    if (blob.includes(term)) matchedTerms += 1;
  });
  score += Math.min(matchedTerms * 16, 48);

  if (
    isTypoMatch(normalizedQuery, name) ||
    isTypoMatch(normalizedQuery, latinName) ||
    nameWords.some((word) => isTypoMatch(normalizedQuery, word))
  ) {
    score += 30;
  }

  score += getPopularScore(product);

  return score;
};

export const scoreCategory = (category: SearchableCategory, query: string) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const expandedTerms = getExpandedTerms(normalizedQuery);
  const name = normalizeText(category.name || "");
  const latinName = normalizeText(
    transliterateBanglaToLatin(category.name || "")
  );

  let score = 0;

  if (name === normalizedQuery || latinName === normalizedQuery) score += 110;
  if (name.startsWith(normalizedQuery) || latinName.startsWith(normalizedQuery)) score += 85;
  if (name.includes(normalizedQuery) || latinName.includes(normalizedQuery)) score += 65;

  const nameWords = name.split(" ").filter(Boolean);
  if (nameWords.some((word) => word.startsWith(normalizedQuery))) score += 35;

  let matchedTerms = 0;
  expandedTerms.forEach((term) => {
    if (name.includes(term) || latinName.includes(term)) matchedTerms += 1;
  });
  score += Math.min(matchedTerms * 16, 48);

  if (
    isTypoMatch(normalizedQuery, name) ||
    isTypoMatch(normalizedQuery, latinName) ||
    nameWords.some((word) => isTypoMatch(normalizedQuery, word))
  ) {
    score += 28;
  }

  return score;
};

export const getBestDidYouMean = (
  query: string,
  products: SearchableProduct[]
) => {
  const q = normalizeText(query);
  if (!q || products.length === 0) return "";

  let bestName = "";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const product of products) {
    const name = normalizeText(product.name || "");
    if (!name) continue;

    const distance = levenshteinDistance(q, name);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestName = product.name || "";
    }
  }

  const allowed = q.length <= 4 ? 2 : q.length <= 8 ? 3 : 4;
  return bestDistance <= allowed ? bestName : "";
};

export const flattenCategories = (
  categories: SearchableCategory[] = []
): SearchableCategory[] =>
  categories.flatMap((cat) => [
    cat,
    ...(Array.isArray(cat.children) ? flattenCategories(cat.children) : []),
  ]);