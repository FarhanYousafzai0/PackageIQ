// PackageIQ Type Definitions

/**
 * @typedef {Object} PackageData
 * @property {string} name - Package name
 * @property {string} version - Latest version
 * @property {string} description - Package description
 * @property {string} license - SPDX license identifier
 * @property {string} homepage - Package homepage URL
 * @property {string[]} keywords - Package keywords
 * @property {number} maintainers - Number of maintainers
 * @property {number} downloads - Weekly download count
 * @property {Array} downloadTrends - Daily download data for charts
 * @property {BundleSize} bundleSize - Bundle size information
 * @property {GithubData} github - GitHub repository data
 * @property {number} healthScore - Health score (0-100)
 * @property {Vulnerabilities} vulnerabilities - Security vulnerabilities
 * @property {string} lastPublished - Last publish date
 * @property {string} created - Creation date
 * @property {MaintenanceData} maintenance - Maintenance status summary
 * @property {TrustSignals} trustSignals - Trust and risk indicators
 * @property {DecisionData} decision - Decision-oriented recommendation payload
 * @property {Alternative[]} alternatives - Suggested alternatives to compare
 */

/**
 * @typedef {Object} BundleSize
 * @property {number} size - Raw size in bytes
 * @property {number} gzip - Gzipped size in bytes
 * @property {boolean} hasJSModule - Has ES module support
 * @property {boolean} hasSideEffects - Has side effects
 * @property {number} dependencyCount - Number of dependencies
 */

/**
 * @typedef {Object} GithubData
 * @property {number} stars - Star count
 * @property {number} forks - Fork count
 * @property {number} openIssues - Open issue count
 * @property {string} lastPush - Last push date
 * @property {string} lastCommit - Last commit date
 * @property {string} lastCommitMessage - Last commit message
 * @property {string} createdAt - Repository creation date
 * @property {string} license - Repository license
 * @property {string[]} topics - Repository topics
 * @property {string} description - Repository description
 * @property {string} homepage - Repository homepage
 * @property {string} url - GitHub URL
 * @property {boolean} archived - Repository archived flag
 */

/**
 * @typedef {Object} Vulnerabilities
 * @property {number} count - Number of known vulnerabilities
 * @property {Array} details - Vulnerability details
 */

/**
 * @typedef {Object} Verdict
 * @property {string} overall - 'recommended' | 'neutral' | 'not-recommended'
 * @property {string} label - Decision label for the package
 * @property {number} confidence - Recommendation confidence percentage
 * @property {string} recommendation - Human-readable recommendation
 * @property {Array} verdicts - List of individual verdict items
 * @property {string[]} reasons - Key reasons behind the recommendation
 * @property {string} nextStep - Suggested next action
 * @property {number} score - Health score
 */

/**
 * @typedef {Object} VerdictItem
 * @property {string} type - 'positive' | 'warning' | 'negative'
 * @property {string} text - Verdict text
 */

/**
 * @typedef {Object} MaintenanceData
 * @property {'active'|'slow'|'stale'} status
 * @property {string|null} lastReleaseDate
 * @property {string|null} lastCommitDate
 * @property {'high'|'medium'|'low'} releaseFrequency
 * @property {number} maintainersCount
 */

/**
 * @typedef {Object} TrustSignals
 * @property {boolean} hasTypes
 * @property {boolean} hasHomepage
 * @property {boolean} hasRepository
 * @property {boolean|null} archived
 * @property {'safe'|'review'|'unknown'} licenseRisk
 * @property {number|null} issueRatio
 * @property {boolean} singleMaintainerRisk
 * @property {number|null} dependencyCount
 */

/**
 * @typedef {Object} DecisionData
 * @property {'install'|'caution'|'avoid'|'review'|'good-but-heavy'|'good-but-stale'|'prefer-alternative'} label
 * @property {number} confidence
 * @property {string[]} reasons
 * @property {string} nextStep
 */

/**
 * @typedef {Object} Alternative
 * @property {string} name
 * @property {string} reason
 * @property {'lighter'|'safer'|'more-popular'|'better-maintained'} relativeStrength
 */

// Export empty object since JSDoc types are for documentation only
export {};
