const COUNT_API_BASE = 'https://api.countapi.xyz';
const NAMESPACE = 'packageiq-public';

const KEYS = {
  siteViews: 'site-views',
  packageSearches: 'package-searches',
  compareViews: 'compare-views',
};

const cache = new Map();

const requestCount = async (path) => {
  const response = await fetch(`${COUNT_API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Count API request failed with status ${response.status}`);
  }

  return response.json();
};

const safeCountRequest = async (path, cacheKey) => {
  try {
    const data = await requestCount(path);
    cache.set(cacheKey, data.value);
    return data.value;
  } catch (error) {
    return cache.get(cacheKey) ?? 0;
  }
};

export const fetchUsageStats = async () => {
  const [siteViews, packageSearches, compareViews] = await Promise.all([
    safeCountRequest(`/get/${NAMESPACE}/${KEYS.siteViews}`, KEYS.siteViews),
    safeCountRequest(`/get/${NAMESPACE}/${KEYS.packageSearches}`, KEYS.packageSearches),
    safeCountRequest(`/get/${NAMESPACE}/${KEYS.compareViews}`, KEYS.compareViews),
  ]);

  return {
    siteViews,
    packageSearches,
    compareViews,
  };
};

export const trackSiteView = async () => {
  if (typeof window !== 'undefined' && sessionStorage.getItem('packageiq_site_viewed')) {
    return cache.get(KEYS.siteViews) ?? 0;
  }

  const value = await safeCountRequest(`/hit/${NAMESPACE}/${KEYS.siteViews}`, KEYS.siteViews);

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('packageiq_site_viewed', '1');
  }

  return value;
};

export const trackPackageSearch = async () =>
  safeCountRequest(`/hit/${NAMESPACE}/${KEYS.packageSearches}`, KEYS.packageSearches);

export const trackCompareView = async () => {
  if (typeof window !== 'undefined' && sessionStorage.getItem('packageiq_compare_viewed')) {
    return cache.get(KEYS.compareViews) ?? 0;
  }

  const value = await safeCountRequest(`/hit/${NAMESPACE}/${KEYS.compareViews}`, KEYS.compareViews);

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('packageiq_compare_viewed', '1');
  }

  return value;
};
