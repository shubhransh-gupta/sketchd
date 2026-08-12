import type { CategoryId, ClassificationResult, Confidence, ProblemDefinition } from './types';
import problemsData from '../../data/problems.json';

const problems = problemsData as ProblemDefinition[];

export function classifyProblem(text: string): ClassificationResult | null {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return null;

  let best: { problem: ProblemDefinition; score: number; matched: string[] } | null = null;

  for (const problem of problems) {
    const matched = problem.keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
    if (matched.length === 0) continue;
    const score = matched.reduce((s, kw) => s + kw.length, 0);
    if (!best || score > best.score) {
      best = { problem, score, matched };
    }
  }

  if (!best) return null;

  const confidence: Confidence =
    best.matched.length >= 2 || best.score >= 12 ? 'high' : best.score >= 6 ? 'likely' : 'uncertain';

  return {
    category: best.problem.category,
    label: best.problem.label,
    confidence,
    matchedKeywords: best.matched,
  };
}

export function getProblemByCategory(category: CategoryId): ProblemDefinition {
  const found = problems.find((p) => p.category === category);
  if (!found) throw new Error(`Unknown category: ${category}`);
  return found;
}

export function detectEmergency(text: string, category: CategoryId): boolean {
  const problem = getProblemByCategory(category);
  const normalized = text.toLowerCase();
  const globalEmergency = [
    'fire',
    'gas leak',
    'person trapped',
    'electrocution',
    'someone hurt',
    'immediate danger',
    'life threat',
  ];
  const keywords = [...(problem.emergencyKeywords ?? []), ...globalEmergency];
  return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
}

export { problems };
