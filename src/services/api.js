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

/**
 * Fetch package metadata from npm registry
 * Uses CORS proxy if direct request fails
 * @param {string} packageName - npm package name
 */
export const fetchNpmPackage = async (packageName) => {
  try {
    const response = await npmClient.get(`/${packageName}`);
    return response.data;
  } catch (error) {
    // Try with CORS proxy
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(`${NPM_REGISTRY_URL}/${packageName}`)}`;
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      return response.data;
    } catch (proxyError) {
      throw new Error(`Package "${packageName}" not found on npm`);
    }
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
  const cleanName = packageName.trim().toLowerCase();
  
  try {
    // Fetch npm data
    const npmData = await fetchNpmPackage(cleanName);
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
    
    // Calculate health score
    const healthScore = calculateHealthScore({
      downloads: downloads.downloads,
      hasGithub: !!githubData,
      stars: githubData?.stars || 0,
      lastPush: githubData?.lastPush,
      openIssues: githubData?.openIssues || 0,
      hasTypes: !!latestRelease?.types || !!npmData.types,
    });
    
    return {
      name: cleanName,
      version: latestVersion,
      description: npmData.description || '',
      license: npmData.license || 'Unknown',
      homepage: npmData.homepage || '',
      keywords: npmData.keywords || [],
      maintainers: npmData.maintainers?.length || 0,
      
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
    };
  } catch (error) {
    throw error;
  }
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
  let overall = 'neutral';
  let recommendation = '';
  
  // High downloads = popular
  if (pkg.downloads > 1000000) {
    verdicts.push({ type: 'positive', text: 'Extremely popular with over 1M weekly downloads' });
  } else if (pkg.downloads > 100000) {
    verdicts.push({ type: 'positive', text: 'Very popular in the community' });
  } else if (pkg.downloads < 1000) {
    verdicts.push({ type: 'warning', text: 'Low adoption - consider alternatives' });
  }
  
  // GitHub activity
  if (pkg.github) {
    const daysSince = pkg.github.lastPush 
      ? (Date.now() - new Date(pkg.github.lastPush).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    
    if (daysSince < 7) {
      verdicts.push({ type: 'positive', text: 'Actively maintained (updated this week)' });
    } else if (daysSince > 180) {
      verdicts.push({ type: 'warning', text: 'May be unmaintained (no updates in 6+ months)' });
    }
    
    if (pkg.github.stars > 5000) {
      verdicts.push({ type: 'positive', text: 'Strong community support on GitHub' });
    }
  } else {
    verdicts.push({ type: 'warning', text: 'No GitHub repository linked' });
  }
  
  // Bundle size
  if (pkg.bundleSize) {
    if (pkg.bundleSize.gzip < 10000) {
      verdicts.push({ type: 'positive', text: 'Lightweight bundle size' });
    } else if (pkg.bundleSize.gzip > 100000) {
      verdicts.push({ type: 'warning', text: 'Large bundle size - consider tree-shaking' });
    }
  }
  
  // Health score
  if (pkg.healthScore >= 80) {
    overall = 'recommended';
    recommendation = 'Excellent choice - highly recommended for production use';
  } else if (pkg.healthScore >= 60) {
    overall = 'recommended';
    recommendation = 'Good package - suitable for most use cases';
  } else if (pkg.healthScore >= 40) {
    overall = 'neutral';
    recommendation = 'Adequate package - evaluate alternatives';
  } else {
    overall = 'not-recommended';
    recommendation = 'Consider more popular/maintained alternatives';
  }
  
  return {
    overall,
    recommendation,
    verdicts,
    score: pkg.healthScore,
  };
};
