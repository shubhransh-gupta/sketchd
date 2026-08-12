import type { Question, QuestionId, CategoryId } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'location_type',
    text: 'Where exactly is this happening?',
    options: [
      { id: 'public_road', label: 'Public road' },
      { id: 'footpath', label: 'Footpath' },
      { id: 'residential', label: 'Residential area' },
      { id: 'private_property', label: 'Private property' },
      { id: 'government_property', label: 'Government property' },
      { id: 'not_sure', label: 'Not sure' },
    ],
  },
  {
    id: 'road_type',
    text: 'What kind of road is it?',
    options: [
      { id: 'local_road', label: 'Local residential road' },
      { id: 'state_highway', label: 'State highway' },
      { id: 'national_highway', label: 'National highway' },
      { id: 'not_sure', label: 'Not sure' },
    ],
    when: { category: ['road', 'traffic'] },
  },
  {
    id: 'water_type',
    text: 'What kind of water problem is it?',
    options: [
      { id: 'drinking_leak', label: 'Drinking water pipeline leak' },
      { id: 'sewage', label: 'Sewage / dirty water' },
      { id: 'contaminated', label: 'Contaminated drinking water' },
      { id: 'no_supply', label: 'No water supply' },
      { id: 'unknown', label: 'Unknown / not sure' },
    ],
    when: { category: ['water'] },
  },
  {
    id: 'noise_now',
    text: 'Is the noise happening right now?',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    when: { category: ['noise'] },
  },
  {
    id: 'noise_timing',
    text: 'When does it usually happen?',
    options: [
      { id: 'day', label: 'Daytime' },
      { id: 'night', label: 'Late night / early morning' },
      { id: 'not_sure', label: 'Not sure' },
    ],
    when: { category: ['noise'] },
  },
  {
    id: 'garbage_type',
    text: 'What type of waste is it?',
    options: [
      { id: 'household', label: 'Household garbage' },
      { id: 'construction', label: 'Construction / debris' },
      { id: 'dead_animal', label: 'Dead animal' },
      { id: 'not_collected', label: 'Garbage not being collected' },
      { id: 'not_sure', label: 'Not sure' },
    ],
    when: { category: ['garbage'] },
  },
  {
    id: 'animal_type',
    text: 'What kind of animal issue?',
    options: [
      { id: 'nuisance', label: 'Nuisance / stray animals' },
      { id: 'aggressive', label: 'Aggressive / dangerous' },
      { id: 'injured', label: 'Injured animal' },
      { id: 'dead', label: 'Dead animal' },
    ],
    when: { category: ['animal'] },
  },
  {
    id: 'construction_type',
    text: 'What is the construction issue?',
    options: [
      { id: 'unauthorized', label: 'Unauthorized construction' },
      { id: 'blocking_road', label: 'Blocking public road' },
      { id: 'setback', label: 'Setback / planning violation' },
      { id: 'not_sure', label: 'Not sure' },
    ],
    when: { category: ['construction'] },
  },
];

export function getQuestionsForCategory(
  category: CategoryId,
  answers: Partial<Record<QuestionId, string>>,
): Question[] {
  const problemQuestions = QUESTIONS.filter((q) => {
    if (q.when?.category && !q.when.category.includes(category)) return false;
    if (q.when?.answers) {
      return Object.entries(q.when.answers).every(([key, val]) => answers[key as QuestionId] === val);
    }
    return true;
  });

  return problemQuestions.filter((q) => answers[q.id] === undefined);
}

export function needsWaterClarification(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('water') && (t.includes('road') || t.includes('street') || t.includes('coming'));
}

export function needsNoiseClarification(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('loud') || t.includes('construction') || t.includes('noise');
}
