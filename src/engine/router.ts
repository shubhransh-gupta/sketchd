import type {
  Authority,
  AuthorityRole,
  CategoryId,
  LocationEntry,
  RoutingResult,
  UserAnswers,
} from './types';
import authoritiesData from '../../data/authorities.json';
import escalationData from '../../data/escalation.json';
import { getProblemByCategory, detectEmergency } from './classifier';
import type { EscalationPath, RoutingRule } from './types';

const authorities = authoritiesData as Authority[];
const escalationPaths = escalationData as EscalationPath[];

const MUNICIPAL_MAP: Record<string, string> = {
  bengaluru: 'bbmp',
  mysuru: 'mysuru-mcc',
  lucknow: 'lmc',
  noida: 'noida-authority',
  mumbai: 'bmc',
  delhi: 'mcd',
};

const WATER_BOARD_MAP: Record<string, string> = {
  delhi: 'djb',
};

const POLLUTION_MAP: Record<string, string> = {
  bengaluru: 'kspcb',
  mysuru: 'kspcb',
  lucknow: 'uppcb',
  noida: 'uppcb',
  mumbai: 'maharashtra-pcb',
  delhi: 'dpcc',
};

const POLICE_MAP: Record<string, string> = {
  bengaluru: 'karnataka-police',
  mysuru: 'karnataka-police',
  lucknow: 'up-police',
  noida: 'up-police',
  mumbai: 'mumbai-police',
  delhi: 'delhi-police',
};

function resolveAuthorityId(role: AuthorityRole, location: LocationEntry): string | null {
  const cityId = location.id;
  switch (role) {
    case 'municipal':
      return MUNICIPAL_MAP[cityId] ?? null;
    case 'water_board':
      return WATER_BOARD_MAP[cityId] ?? MUNICIPAL_MAP[cityId] ?? null;
    case 'electricity':
      return cityId === 'bengaluru' ? 'bescom' : MUNICIPAL_MAP[cityId] ?? null;
    case 'pollution':
      return POLLUTION_MAP[cityId] ?? null;
    case 'police':
      return POLICE_MAP[cityId] ?? null;
    case 'nhai':
      return 'nhai';
    case 'state_roads':
      return MUNICIPAL_MAP[cityId] ?? null;
    default:
      return null;
  }
}

function getAuthority(id: string): Authority | null {
  return authorities.find((a) => a.id === id) ?? null;
}

function ruleMatches(rule: RoutingRule, answers: UserAnswers): boolean {
  return Object.entries(rule.condition).every(([key, val]) => answers[key as keyof UserAnswers] === val);
}

function pickRule(rules: RoutingRule[], answers: UserAnswers): RoutingRule {
  const specific = rules.filter((r) => Object.keys(r.condition).length > 0 && ruleMatches(r, answers));
  if (specific.length > 0) return specific[0];
  const fallback = rules.find((r) => Object.keys(r.condition).length === 0);
  if (!fallback) return rules[rules.length - 1];
  return fallback;
}

function getEscalation(category: CategoryId, location: LocationEntry) {
  const specific = escalationPaths.find(
    (p) => p.category === category && p.jurisdictionPattern === location.id,
  );
  const general = escalationPaths.find(
    (p) => p.category === category && p.jurisdictionPattern === '*',
  );
  return (specific ?? general)?.steps ?? [
    { order: 1, label: 'File complaint with the identified authority' },
    { order: 2, label: 'Follow up with local grievance cell' },
    { order: 3, label: 'Escalate via state or central grievance portal (pgportal.gov.in)' },
  ];
}

export function routeComplaint(
  category: CategoryId,
  location: LocationEntry,
  answers: UserAnswers,
  problemText: string,
): RoutingResult | null {
  const problem = getProblemByCategory(category);
  const rule = pickRule(problem.routing, answers);

  const primaryId = resolveAuthorityId(rule.authorityRole, location);
  if (!primaryId) return null;

  const primaryAuthority = getAuthority(primaryId);
  if (!primaryAuthority) return null;

  const isEmergency = detectEmergency(problemText, category);

  let secondary: RoutingResult['secondary'];
  if (rule.secondaryAuthorityRole) {
    const secId = resolveAuthorityId(rule.secondaryAuthorityRole, location);
    const secAuth = secId ? getAuthority(secId) : null;
    if (secAuth && rule.secondaryReason) {
      secondary = { authority: secAuth, reason: rule.secondaryReason };
    }
  }

  const emergencyContacts = isEmergency && location.emergency
    ? [
        { label: 'Police', number: location.emergency.police },
        { label: 'Fire', number: location.emergency.fire },
        { label: 'Ambulance', number: location.emergency.ambulance },
      ]
    : undefined;

  return {
    category,
    problemLabel: problem.label,
    primary: {
      authority: primaryAuthority,
      department: rule.department,
      confidence: rule.confidence,
      reason: rule.reason,
    },
    secondary,
    submitChecklist: problem.submitChecklist,
    escalation: getEscalation(category, location),
    isEmergency,
    emergencyMessage: isEmergency
      ? 'This may be an emergency. Do not wait for a normal civic complaint process — contact emergency services immediately.'
      : undefined,
    emergencyContacts,
  };
}

export function getAuthoritiesForLocation(location: LocationEntry): Authority[] {
  return location.authorityIds
    .map((id) => getAuthority(id))
    .filter((a): a is Authority => a !== null);
}

export { authorities };
