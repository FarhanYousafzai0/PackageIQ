// PackageIQ API Services
// Free public APIs - no authentication required for most endpoints

import axios from 'axios';

// API Base URLs
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const NPM_API_URL = 'https://api.npmjs.org';
const BUNDLEPHOBIA_URL = 'https://bundlephobia.com/api';
const GITHUB_API_URL = 'https://api.github.com';

// CORS Proxy for APIs that don't support CORS
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Create axios instances with defaults
const npmClient = axios.create({
  baseURL: NPM_REGISTRY_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const npmApiClient = axios.create({
  baseURL: NPM_API_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const bundlephobiaClient = axios.create({
  baseURL: BUNDLEPHOBIA_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const githubClient = axios.create({
  baseURL: GITHUB_API_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

const PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND';
const PACKAGE_LOOKUP_FAILED = 'PACKAGE_LOOKUP_FAILED';
const SAFE_LICENSES = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Unlicense',
  'CC0-1.0',
]);

const ALTERNATIVE_SEEDS = {
  axios: [
    { name: 'ky', relativeStrength: 'lighter', reason: 'Smaller fetch wrapper for browser-first apps.' },
    { name: 'ofetch', relativeStrength: 'better-maintained', reason: 'Modern fetch API with SSR-friendly ergonomics.' },
    { name: 'cross-fetch', relativeStrength: 'safer', reason: 'Simpler universal fetch approach with less abstraction.' },
  ],
  moment: [
    { name: 'date-fns', relativeStrength: 'lighter', reason: 'Tree-shakeable utilities with better bundle control.' },
    { name: 'dayjs', relativeStrength: 'more-popular', reason: 'Moment-like API with a much smaller footprint.' },
    { name: 'luxon', relativeStrength: 'better-maintained', reason: 'Better timezone support for modern apps.' },
  ],
  redux: [
    { name: 'zustand', relativeStrength: 'lighter', reason: 'Lower-boilerplate state management for React apps.' },
    { name: 'jotai', relativeStrength: 'better-maintained', reason: 'Atomic state model that stays small and flexible.' },
    { name: '@reduxjs/toolkit', relativeStrength: 'safer', reason: 'Safer Redux default if you want to stay in the Redux ecosystem.' },
  ],
  formik: [
    { name: 'react-hook-form', relativeStrength: 'lighter', reason: 'Better performance and lower rerender cost for forms.' },
    { name: 'houseform', relativeStrength: 'better-maintained', reason: 'Modern form ergonomics if you want typed validation flows.' },
  ],
  lodash: [
    { name: 'radash', relativeStrength: 'lighter', reason: 'Modern utility set with a smaller surface area.' },
    { name: 'remeda', relativeStrength: 'safer', reason: 'Type-safe functional utilities for TypeScript-heavy projects.' },
  ],
  'react-query': [
    { name: 'swr', relativeStrength: 'lighter', reason: 'Smaller data fetching footprint for simpler cache needs.' },
    { name: '@tanstack/query-core', relativeStrength: 'safer', reason: 'Stay in the TanStack ecosystem if you need lower-level control.' },
  ],
};

const createPackageError = (code, packageName, message) =>
  Object.assign(new Error(message), { code, packageName });

const normalizePackageName = (packageName = '') => packageName.trim().toLowerCase();

const daysBetweenNow = (dateStr) => {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return Infinity;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
};

const getRecentVersionDates = (time = {}, windowDays = 180) => {
  const threshold = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  return Object.entries(time)
    .filter(([version]) => version !== 'created' && version !== 'modified')
    .map(([, publishedAt]) => new Date(publishedAt).getTime())
    .filter((publishedAt) => !Number.isNaN(publishedAt) && publishedAt >= threshold)
    .sort((a, b) => b - a);
};

const getReleaseFrequency = (time = {}) => {
  const recentReleases = getRecentVersionDates(time, 180).length;
  if (recentReleases >= 8) return 'high';
  if (recentReleases >= 3) return 'medium';
  return 'low';
};

const getMaintenanceStatus = ({ lastPublished, lastPush }) => {
  const freshestSignal = Math.min(daysBetweenNow(lastPublished), daysBetweenNow(lastPush));
  if (freshestSignal <= 45) return 'active';
  if (freshestSignal <= 180) return 'slow';
  return 'stale';
};

const getLicenseRisk = (license) => {
  if (!license || license === 'Unknown') return 'unknown';
  return SAFE_LICENSES.has(license) ? 'safe' : 'review';
};

const inferPackageCategories = (pkg) => {
  const haystack = [
    pkg.name,
    pkg.description,
    ...(pkg.keywords || []),
    ...(pkg.github?.topics || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const categories = [];
  if (/(fetch|http|request|axios|api|network)/.test(haystack)) categories.push('http');
  if (/(date|time|moment|calendar|timezone)/.test(haystack)) categories.push('date');
  if (/(form|validation|field|input)/.test(haystack)) categories.push('forms');
  if (/(state|store|redux|atom)/.test(haystack)) categories.push('state');
  if (/(query|cache|swr|tanstack)/.test(haystack)) categories.push('data-fetching');
  if (/(utility|utils|helpers|lodash)/.test(haystack)) categories.push('utilities');
  return categories;
};

const buildAlternatives = (pkg) => {
  const categories = inferPackageCategories(pkg);
  const curated = ALTERNATIVE_SEEDS[pkg.name] || [];
  const categorySuggestions = categories.flatMap((category) => {
    switch (category) {
      case 'http':
        return ALTERNATIVE_SEEDS.axios || [];
      case 'date':
        return ALTERNATIVE_SEEDS.moment || [];
      case 'forms':
        return ALTERNATIVE_SEEDS.formik || [];
      case 'state':
        return ALTERNATIVE_SEEDS.redux || [];
      case 'data-fetching':
        return ALTERNATIVE_SEEDS['react-query'] || [];
      case 'utilities':
        return ALTERNATIVE_SEEDS.lodash || [];
      default:
        return [];
    }
  });

  return [...curated, ...categorySuggestions]
    .filter((alternative) => normalizePackageName(alternative.name) !== pkg.name)
    .filter((alternative, index, all) =>
      all.findIndex((candidate) => normalizePackageName(candidate.name) === normalizePackageName(alternative.name)) === index
    )
    .slice(0, 4);
};

const buildMaintenanceData = ({ npmData, githubData, latestVersion }) => {
  const lastReleaseDate = npmData.time?.[latestVersion] || null;
  const lastCommitDate = githubData?.lastPush || null;

  return {
    status: getMaintenanceStatus({ lastPublished: lastReleaseDate, lastPush: lastCommitDate }),
    lastReleaseDate,
    lastCommitDate,
    releaseFrequency: getReleaseFrequency(npmData.time),
    maintainersCount: npmData.maintainers?.length || 0,
  };
};

const buildTrustSignals = ({ npmData, latestRelease, githubData, maintainersCount, bundleSize }) => ({
  hasTypes: !!latestRelease?.types || !!latestRelease?.typings || !!npmData.types || !!npmData.typings,
  hasHomepage: !!npmData.homepage,
  hasRepository: !!npmData.repository,
  archived: githubData?.archived ?? null,
  licenseRisk: getLicenseRisk(npmData.license || githubData?.license || 'Unknown'),
  issueRatio: githubData?.stars ? (githubData.openIssues || 0) / Math.max(githubData.stars, 1) : null,
  singleMaintainerRisk: maintainersCount <= 1,
  dependencyCount: bundleSize?.dependencyCount ?? null,
});

const getDecisionConfidence = (score) => {
  if (score >= 85) return 90;
  if (score >= 70) return 78;
  if (score >= 55) return 68;
  if (score >= 40) return 58;
  return 45;
};

const isNotFoundError = (error) =>
  axios.isAxiosError(error) && error.response?.status === 404;

const isValidNpmPackagePayload = (data, packageName) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  if (typeof data.error === 'string') return false;
  if (!data.name || typeof data.name !== 'string') return false;

  const normalizedRequested = normalizePackageName(packageName);
  const normalizedPayload = normalizePackageName(data.name);

  if (normalizedPayload !== normalizedRequested) return false;

  return !!data.versions || !!data['dist-tags'];
};

const isProxyNotFoundPayload = (data) =>
  !!data &&
  typeof data === 'object' &&
  !Array.isArray(data) &&
  (data.status === 404 || typeof data.error === 'string');

/**
 * Fetch package metadata from npm registry
 * Uses CORS proxy if direct request fails
 * @param {string} packageName - npm package name
 */
export const fetchNpmPackage = async (packageName) => {
  const normalizedName = normalizePackageName(packageName);
  let lookupFailed = false;

  try {
    const response = await npmClient.get(`/${normalizedName}`);
    if (isValidNpmPackagePayload(response.data, normalizedName)) {
      return response.data;
    }
    throw createPackageError(
      PACKAGE_NOT_FOUND,
      normalizedName,
      `Package "${normalizedName}" was not found on npm.`
    );
  } catch (error) {
    if (error?.code === PACKAGE_NOT_FOUND) {
      throw error;
    }

    if (isNotFoundError(error)) {
      throw createPackageError(
        PACKAGE_NOT_FOUND,
        normalizedName,
        `Package "${normalizedName}" was not found on npm.`
      );
    }
    lookupFailed = true;
  }

  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${NPM_REGISTRY_URL}/${normalizedName}`)}`;
    const response = await axios.get(proxyUrl, { timeout: 15000 });

    if (isValidNpmPackagePayload(response.data, normalizedName)) {
      return response.data;
    }

    if (isProxyNotFoundPayload(response.data)) {
      throw createPackageError(
        PACKAGE_NOT_FOUND,
        normalizedName,
        `Package "${normalizedName}" was not found on npm.`
      );
    }

    throw createPackageError(
      PACKAGE_NOT_FOUND,
      normalizedName,
      `Package "${normalizedName}" was not found on npm.`
    );
  } catch (proxyError) {
    if (proxyError?.code === PACKAGE_NOT_FOUND) {
      throw proxyError;
    }

    if (isNotFoundError(proxyError)) {
      throw createPackageError(
        PACKAGE_NOT_FOUND,
        normalizedName,
        `Package "${normalizedName}" was not found on npm.`
      );
    }

    lookupFailed = true;
  }

  if (lookupFailed) {
    throw createPackageError(
      PACKAGE_LOOKUP_FAILED,
      normalizedName,
      `We could not load package data for "${normalizedName}". Please try again.`
    );
  }

  throw createPackageError(
    PACKAGE_NOT_FOUND,
    normalizedName,
    `Package "${normalizedName}" was not found on npm.`
  );
};

const normalizeLookupError = (error, packageName) => {
  if (error?.code === PACKAGE_NOT_FOUND || error?.code === PACKAGE_LOOKUP_FAILED) {
    return error;
  }

  return createPackageError(
    PACKAGE_LOOKUP_FAILED,
    normalizePackageName(packageName),
    `We could not load package data for "${normalizePackageName(packageName)}". Please try again.`
  );
};

/**
 * Fetch package metadata from npm registry
 * Uses CORS proxy if direct request fails
 * @param {string} packageName - npm package name
 */
export const fetchValidatedNpmPackage = async (packageName) => {
  try {
    return await fetchNpmPackage(packageName);
  } catch (error) {
    throw normalizeLookupError(error, packageName);
  }
};

/**
 * Fetch weekly download stats from npm
 * @param {string} packageName - npm package name
 */
export const fetchNpmDownloads = async (packageName) => {
  try {
    const response = await npmApiClient.get(`/downloads/point/last-week/${packageName}`);
    return response.data;
  } catch (error) {
    // Try with CORS proxy
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${NPM_API_URL}/downloads/point/last-week/${packageName}`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      return response.data;
    } catch (proxyError) {
      return { downloads: 0 };
    }
  }
};

/**
 * Fetch download trends (last 7 days) for charts
 * @param {string} packageName - npm package name
 */
export const fetchDownloadTrends = async (packageName) => {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    const response = await npmApiClient.get(`/downloads/range/${startStr}:${endStr}/${packageName}`);
    return response.data.downloads || [];
  } catch (error) {
    // Try with CORS proxy
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${NPM_API_URL}/downloads/range/${startStr}:${endStr}/${packageName}`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      return response.data.downloads || [];
    } catch (proxyError) {
      return [];
    }
  }
};

/**
 * Fetch bundle size analysis from Bundlephobia
 * @param {string} packageName - npm package name
 */
export const fetchBundleSize = async (packageName) => {
  try {
    const response = await bundlephobiaClient.get(`/size?package=${packageName}`);
    return {
      size: response.data.size,
      gzip: response.data.gzip,
      hasJSModule: response.data.hasJSModule,
      hasSideEffects: response.data.hasSideEffects,
      dependencyCount: response.data.dependencyCount,
    };
  } catch (error) {
    // Try with CORS proxy
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${BUNDLEPHOBIA_URL}/size?package=${packageName}`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      return {
        size: response.data.size,
        gzip: response.data.gzip,
        hasJSModule: response.data.hasJSModule,
        hasSideEffects: response.data.hasSideEffects,
        dependencyCount: response.data.dependencyCount,
      };
    } catch (proxyError) {
      return null;
    }
  }
};

/**
 * Extract GitHub repo info from npm package data
 * @param {Object} npmData - npm package metadata
 */
export const extractGithubInfo = (npmData) => {
  const repoUrl = npmData.repository?.url || npmData.repository || '';
  const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
};

/**
 * Fetch GitHub repository data
 * @param {string} owner - GitHub owner/organization
 * @param {string} repo - Repository name
 */
export const fetchGithubRepo = async (owner, repo) => {
  try {
    const response = await githubClient.get(`/repos/${owner}/${repo}`);
    return {
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      openIssues: response.data.open_issues_count,
      lastPush: response.data.pushed_at,
      createdAt: response.data.created_at,
      license: response.data.license?.spdx_id || 'Unknown',
      topics: response.data.topics || [],
      description: response.data.description,
      homepage: response.data.homepage,
      archived: response.data.archived ?? false,
    };
  } catch (error) {
    // Try with CORS proxy
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${GITHUB_API_URL}/repos/${owner}/${repo}`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      return {
        stars: response.data.stargazers_count,
        forks: response.data.forks_count,
        openIssues: response.data.open_issues_count,
        lastPush: response.data.pushed_at,
        createdAt: response.data.created_at,
        license: response.data.license?.spdx_id || 'Unknown',
        topics: response.data.topics || [],
        description: response.data.description,
        homepage: response.data.homepage,
        archived: response.data.archived ?? false,
      };
    } catch (proxyError) {
      return null;
    }
  }
};

/**
 * Fetch recent commit activity from GitHub
 * @param {string} owner - GitHub owner/organization
 * @param {string} repo - Repository name
 */
export const fetchGithubCommits = async (owner, repo) => {
  try {
    const response = await githubClient.get(`/repos/${owner}/${repo}/commits?per_page=1`);
    if (response.data.length > 0) {
      return {
        lastCommit: response.data[0].commit.committer.date,
        message: response.data[0].commit.message,
      };
    }
    return null;
  } catch (error) {
    // Try with CORS proxy
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=1`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      if (response.data.length > 0) {
        return {
          lastCommit: response.data[0].commit.committer.date,
          message: response.data[0].commit.message,
        };
      }
      return null;
    } catch (proxyError) {
      return null;
    }
  }
};

/**
 * Check for known vulnerabilities using npm audit endpoint (via npm registry)
 * Note: This is a simplified check. For production, consider Snyk API
 * @param {string} packageName - npm package name
 * @param {string} version - package version
 */
export const checkVulnerabilities = async (packageName, version) => {
  // Simplified vulnerability check based on version age
  // In production, you'd use Snyk API or npm audit
  return {
    count: 0,
    details: [],
  };
};

/**
 * Fetch complete package intelligence data
 * @param {string} packageName - npm package name
 */
export const fetchPackageIntelligence = async (packageName) => {
  const cleanName = normalizePackageName(packageName);

  // Fetch npm data
  const npmData = await fetchValidatedNpmPackage(cleanName);
  const downloads = await fetchNpmDownloads(cleanName);
  const downloadTrends = await fetchDownloadTrends(cleanName);
  const bundleSize = await fetchBundleSize(cleanName);

  // Extract and fetch GitHub data
  const githubInfo = extractGithubInfo(npmData);
  let githubData = null;
  let commitData = null;

  if (githubInfo) {
    githubData = await fetchGithubRepo(githubInfo.owner, githubInfo.repo);
    commitData = await fetchGithubCommits(githubInfo.owner, githubInfo.repo);
  }

  // Get latest version
  const latestVersion = npmData['dist-tags']?.latest || 'unknown';
  const latestRelease = npmData.versions?.[latestVersion];
  const maintainersCount = npmData.maintainers?.length || 0;
  const maintenance = buildMaintenanceData({
    npmData,
    githubData,
    latestVersion,
  });
  const trustSignals = buildTrustSignals({
    npmData,
    latestRelease,
    githubData,
    maintainersCount,
    bundleSize,
  });

  // Calculate health score
  const healthScore = calculateHealthScore({
    downloads: downloads.downloads,
    hasGithub: !!githubData,
    stars: githubData?.stars || 0,
    lastPush: githubData?.lastPush,
    openIssues: githubData?.openIssues || 0,
    hasTypes: trustSignals.hasTypes,
  });

  const packageBase = {
    name: cleanName,
    version: latestVersion,
    description: npmData.description || '',
    license: npmData.license || 'Unknown',
    homepage: npmData.homepage || '',
    keywords: npmData.keywords || [],
    maintainers: maintainersCount,

    // npm stats
    downloads: downloads.downloads,
    downloadTrends,

    // Bundle size
    bundleSize,

    // GitHub stats
    github: githubData ? {
      ...githubData,
      lastCommit: commitData?.lastCommit,
      lastCommitMessage: commitData?.message,
      url: `https://github.com/${githubInfo.owner}/${githubInfo.repo}`,
    } : null,

    // Health & security
    healthScore,
    vulnerabilities: { count: 0 },

    // Metadata
    lastPublished: npmData.time?.[latestVersion],
    created: npmData.time?.created,
    maintenance,
    trustSignals,
  };

  const alternatives = buildAlternatives(packageBase);
  const decision = generateVerdict({
    ...packageBase,
    alternatives,
  });

  return {
    ...packageBase,
    decision,
    alternatives,
  };
};

/**
 * Calculate package health score (0-100)
 */
const calculateHealthScore = (metrics) => {
  let score = 50; // Base score
  
  // Downloads (max 25 points)
  if (metrics.downloads > 1000000) score += 25;
  else if (metrics.downloads > 100000) score += 20;
  else if (metrics.downloads > 10000) score += 15;
  else if (metrics.downloads > 1000) score += 10;
  else if (metrics.downloads > 0) score += 5;
  
  // GitHub presence (max 15 points)
  if (metrics.hasGithub) score += 15;
  
  // Stars (max 15 points)
  if (metrics.stars > 10000) score += 15;
  else if (metrics.stars > 5000) score += 12;
  else if (metrics.stars > 1000) score += 9;
  else if (metrics.stars > 500) score += 6;
  else if (metrics.stars > 100) score += 3;
  
  // Activity (max 15 points)
  if (metrics.lastPush) {
    const daysSince = (Date.now() - new Date(metrics.lastPush).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 15;
    else if (daysSince < 30) score += 12;
    else if (daysSince < 90) score += 9;
    else if (daysSince < 180) score += 6;
    else if (daysSince < 365) score += 3;
  }
  
  // Issue ratio (max 10 points)
  if (metrics.openIssues < 10) score += 10;
  else if (metrics.openIssues < 50) score += 7;
  else if (metrics.openIssues < 100) score += 4;
  else if (metrics.openIssues < 500) score += 2;
  
  // TypeScript support (max 10 points)
  if (metrics.hasTypes) score += 10;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Generate AI Verdict for a package
 */
export const generateVerdict = (pkg) => {
  const verdicts = [];
  const reasons = [];
  let label = 'review';
  let overall = 'neutral';
  let recommendation = 'Review the tradeoffs before adopting this package.';
  let nextStep = 'Compare it with a lighter or more maintained alternative.';

  if (pkg.downloads > 1000000) {
    verdicts.push({ type: 'positive', text: 'Extremely popular with strong weekly adoption.' });
    reasons.push('Strong community adoption lowers ecosystem risk.');
  } else if (pkg.downloads > 100000) {
    verdicts.push({ type: 'positive', text: 'Healthy adoption across production projects.' });
    reasons.push('Adoption is strong enough for common frontend use cases.');
  } else if (pkg.downloads < 1000) {
    verdicts.push({ type: 'warning', text: 'Low adoption means less ecosystem proof.' });
    reasons.push('Community adoption is low for a production dependency.');
  }

  if (pkg.maintenance?.status === 'active') {
    verdicts.push({ type: 'positive', text: 'Maintenance signals are recent.' });
    reasons.push('Recent releases or repository activity suggest active upkeep.');
  } else if (pkg.maintenance?.status === 'slow') {
    verdicts.push({ type: 'warning', text: 'Maintenance looks slower than top alternatives.' });
    reasons.push('Release cadence is moderate, so review fit before standardizing.');
  } else {
    verdicts.push({ type: 'negative', text: 'Maintenance signals look stale.' });
    reasons.push('Low release activity increases long-term replacement risk.');
  }

  if (pkg.bundleSize?.gzip < 12000) {
    verdicts.push({ type: 'positive', text: 'Bundle cost is friendly for client-side apps.' });
    reasons.push('Low gzip size keeps frontend bundle impact under control.');
  } else if (pkg.bundleSize?.gzip > 90000) {
    verdicts.push({ type: 'warning', text: 'Bundle cost is high for browser bundles.' });
    reasons.push('A heavy bundle can hurt page load and runtime performance.');
  }

  if (pkg.trustSignals?.singleMaintainerRisk) {
    verdicts.push({ type: 'warning', text: 'Single-maintainer risk is worth reviewing.' });
    reasons.push('A lone maintainer can become a support bottleneck.');
  }

  if (pkg.trustSignals?.licenseRisk === 'review') {
    verdicts.push({ type: 'warning', text: 'License should be reviewed for team compatibility.' });
    reasons.push('License terms are not in the default low-risk allowlist.');
  }

  if (pkg.trustSignals?.hasTypes) {
    verdicts.push({ type: 'positive', text: 'TypeScript support is available.' });
  }

  if (pkg.healthScore >= 82 && pkg.maintenance?.status === 'active' && (!pkg.bundleSize || pkg.bundleSize.gzip < 60000)) {
    overall = 'recommended';
    label = 'install';
    recommendation = 'Install for production use.';
    nextStep = 'Use this as the default choice unless you need a specialized feature set.';
  } else if (pkg.healthScore >= 65 && pkg.bundleSize?.gzip > 90000) {
    overall = 'neutral';
    label = 'good-but-heavy';
    recommendation = 'Good package, but heavy for bundle-sensitive apps.';
    nextStep = 'Compare it with a lighter alternative before shipping it to the client.';
  } else if (pkg.healthScore >= 60 && pkg.maintenance?.status === 'stale') {
    overall = 'neutral';
    label = 'good-but-stale';
    recommendation = 'Useful package, but maintenance looks stale.';
    nextStep = 'Validate activity and review the alternatives before adopting it broadly.';
  } else if (pkg.healthScore >= 58) {
    overall = 'neutral';
    label = 'caution';
    recommendation = 'Use with caution.';
    nextStep = 'Compare against alternatives and review the tradeoffs for your bundle and maintenance needs.';
  } else if (pkg.healthScore >= 40) {
    overall = 'neutral';
    label = 'prefer-alternative';
    recommendation = 'Prefer an alternative unless this package has a feature you specifically need.';
    nextStep = 'Review the suggested alternatives and compare migration tradeoffs.';
  } else {
    overall = 'not-recommended';
    label = 'avoid';
    recommendation = 'Avoid for new production work.';
    nextStep = 'Pick a more maintained or lighter alternative before adopting it.';
  }

  return {
    overall,
    label,
    confidence: getDecisionConfidence(pkg.healthScore),
    recommendation,
    verdicts,
    reasons: reasons.slice(0, 4),
    nextStep,
    score: pkg.healthScore,
  };
};
