import { INITIAL_MERCHANT_ACTIVITY, INITIAL_MERCHANT_AUDIT } from '../src/services/merchantData';
import { AuditLog } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

console.log('--- Testing MerchantOS AI Audit Trail & Shared Canonical Events ---');

// 1. Check Initial Audit Records exist for all merchants
assert(INITIAL_MERCHANT_AUDIT.merchant_sports.length > 0, 'UrbanKart has initial audit logs');
assert(INITIAL_MERCHANT_AUDIT.merchant_fashion.length > 0, 'FashionHub has initial audit logs');
assert(INITIAL_MERCHANT_AUDIT.merchant_tech.length > 0, 'TechNest has initial audit logs');

// 2. Check Activity & Audit parity for UrbanKart (merchant_sports)
const sportsAudit = INITIAL_MERCHANT_AUDIT.merchant_sports;
const sportsActivity = INITIAL_MERCHANT_ACTIVITY.merchant_sports;

assert(sportsAudit.length >= 7, `UrbanKart audit logs contain comprehensive agent history (${sportsAudit.length} records)`);
assert(sportsActivity.length >= 6, `UrbanKart activity stream contains matching operational events (${sportsActivity.length} records)`);

// 3. Test Exact Agent Filtering for Audit Trail without Cross-Contamination
const filterAuditLogs = (logs: AuditLog[], filterAgent: string) => {
  if (filterAgent === 'ALL') return logs;
  const target = filterAgent.toUpperCase();
  return logs.filter(log => {
    const logAgent = (log.agent || log.agentId || '').toUpperCase();
    const logAgentName = (log.agentName || '').toUpperCase();

    if (target === 'SUPERVISOR') {
      return logAgent === 'SUPERVISOR' || (logAgentName.includes('SUPERVISOR') && !logAgentName.includes('INTENT'));
    }
    if (target === 'INTENT') {
      return logAgent === 'INTENT' || (logAgentName.includes('INTENT') && !logAgentName.includes('SUPERVISOR'));
    }
    if (target === 'MERCHANDISING') {
      return logAgent === 'MERCHANDISING' || logAgentName.includes('MERCHANDISING');
    }
    if (target === 'RECOVERY') {
      return logAgent === 'RECOVERY' || logAgentName.includes('RECOVERY');
    }
    if (target === 'POLICY') {
      return logAgent === 'POLICY' || logAgentName.includes('POLICY');
    }
    if (target === 'COMMERCE') {
      return logAgent === 'COMMERCE' || logAgentName.includes('COMMERCE');
    }
    return logAgent === target;
  });
};

// Test ALL Filter
const allLogs = filterAuditLogs(sportsAudit, 'ALL');
assert(allLogs.length === sportsAudit.length, `ALL filter returns all audit records (${allLogs.length})`);

// Test SUPERVISOR Filter
const supervisorLogs = filterAuditLogs(sportsAudit, 'SUPERVISOR');
assert(supervisorLogs.length >= 2, `Filtering by SUPERVISOR returns signal routing and approval events (found ${supervisorLogs.length})`);
assert(supervisorLogs.every(l => l.agent === 'SUPERVISOR'), 'Supervisor filter returns ONLY Supervisor agent logs');

// Test INTENT Filter
const intentLogs = filterAuditLogs(sportsAudit, 'INTENT');
assert(intentLogs.length >= 1, `Filtering by INTENT returns customer purchase intent classification (found ${intentLogs.length})`);
assert(intentLogs.every(l => l.agent === 'INTENT'), 'Intent filter returns ONLY Intent agent logs without Supervisor cross-contamination');

// Test MERCHANDISING Filter
const merchandisingLogs = filterAuditLogs(sportsAudit, 'MERCHANDISING');
assert(merchandisingLogs.length >= 1, `Filtering by MERCHANDISING returns bundle recommendations (found ${merchandisingLogs.length})`);
assert(merchandisingLogs.every(l => l.agent === 'MERCHANDISING'), 'Merchandising filter returns ONLY Merchandising agent logs');

// Test RECOVERY Filter
const recoveryLogs = filterAuditLogs(sportsAudit, 'RECOVERY');
assert(recoveryLogs.length >= 1, `Filtering by RECOVERY returns recovery payment link recommendation (found ${recoveryLogs.length})`);
assert(recoveryLogs.every(l => l.agent === 'RECOVERY'), 'Recovery filter returns ONLY Recovery agent logs without cross-contamination');

// Test POLICY Filter
const policyLogs = filterAuditLogs(sportsAudit, 'POLICY');
assert(policyLogs.length >= 2, `Filtering by POLICY returns approved and blocked rules (found ${policyLogs.length})`);
assert(policyLogs.some(l => l.policyStatus === 'BLOCKED'), 'Policy filter includes blocked actions when limits exceeded');
assert(policyLogs.every(l => l.agent === 'POLICY'), 'Policy filter returns ONLY Policy agent logs');

// Test COMMERCE Filter
const commerceLogs = filterAuditLogs(sportsAudit, 'COMMERCE');
assert(commerceLogs.length >= 2, `Filtering by COMMERCE returns real captured & checkout events (found ${commerceLogs.length})`);
assert(commerceLogs.some(l => l.agentDecision.includes('Razorpay Test Mode')), 'Commerce filter includes Razorpay Test Mode captures');
assert(commerceLogs.every(l => l.agent === 'COMMERCE'), 'Commerce filter returns ONLY Commerce agent logs');

// 4. Test Cryptographic Traceability and Schema Validity
for (const log of sportsAudit) {
  assert(Boolean(log.id && log.timestamp && (log.agent || log.agentId) && log.agentDecision && log.toolUsed && log.signatureHash),
    `Audit log ${log.id} has complete cryptographic structure: ${log.agent} - ${log.agentDecision.slice(0, 45)}...`
  );
  assert(log.signatureHash.startsWith('0x'), `Signature hash is cryptographically formatted: ${log.signatureHash}`);
}

console.log('\n✨ All Audit Trail & Shared Canonical Event tests passed successfully!\n');
