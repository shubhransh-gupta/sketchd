export type ComplaintChannel = {
  type: 'web' | 'phone' | 'email' | 'app';
  label: string;
  url?: string;
  value?: string;
  note?: string;
};

export type Authority = {
  id: string;
  name: string;
  shortName?: string;
  state: string;
  jurisdiction: string[];
  departments: string[];
  complaint_channels: ComplaintChannel[];
  website?: string;
  source?: string;
  lastVerified?: string;
};

export type LocationEntry = {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  pinCodes?: string[];
  aliases?: string[];
  authorityIds: string[];
  emergency?: { police: string; fire: string; ambulance: string };
};

export type CategoryId =
  | 'garbage'
  | 'road'
  | 'street_light'
  | 'water'
  | 'drainage'
  | 'noise'
  | 'construction'
  | 'animal'
  | 'traffic'
  | 'encroachment';

export type QuestionId =
  | 'location_type'
  | 'road_type'
  | 'water_type'
  | 'noise_timing'
  | 'noise_now'
  | 'garbage_type'
  | 'animal_type'
  | 'construction_type';

export type Confidence = 'high' | 'likely' | 'uncertain';

export type UserAnswers = Partial<Record<QuestionId, string>>;

export type RoutingRule = {
  condition: Record<string, string>;
  authorityRole: AuthorityRole;
  department?: string;
  confidence: Confidence;
  reason: string;
  secondaryAuthorityRole?: AuthorityRole;
  secondaryReason?: string;
};

export type ProblemDefinition = {
  id: string;
  category: CategoryId;
  label: string;
  keywords: string[];
  questions: QuestionId[];
  routing: RoutingRule[];
  submitChecklist: string[];
  emergencyKeywords?: string[];
};

export type EscalationStep = {
  order: number;
  label: string;
  authorityId?: string;
  url?: string;
  note?: string;
};

export type EscalationPath = {
  id: string;
  category: CategoryId;
  jurisdictionPattern: string;
  steps: EscalationStep[];
};

export type AuthorityRole =
  | 'municipal'
  | 'water_board'
  | 'electricity'
  | 'pollution'
  | 'police'
  | 'nhai'
  | 'state_roads';

export type ClassificationResult = {
  category: CategoryId;
  label: string;
  confidence: Confidence;
  matchedKeywords: string[];
};

export type RoutingResult = {
  primary: {
    authority: Authority;
    department?: string;
    confidence: Confidence;
    reason: string;
  };
  secondary?: { authority: Authority; reason: string };
  alternatives?: Array<{ authority: Authority; reason: string }>;
  submitChecklist: string[];
  escalation: EscalationStep[];
  isEmergency: boolean;
  emergencyMessage?: string;
  emergencyContacts?: Array<{ label: string; number: string }>;
  problemLabel: string;
  category: CategoryId;
};

export const CATEGORIES: Array<{ id: CategoryId; emoji: string; label: string }> = [
  { id: 'garbage', emoji: '🗑', label: 'Garbage' },
  { id: 'street_light', emoji: '💡', label: 'Street light' },
  { id: 'road', emoji: '🕳', label: 'Road' },
  { id: 'water', emoji: '💧', label: 'Water' },
  { id: 'drainage', emoji: '🚰', label: 'Drainage' },
  { id: 'noise', emoji: '🔊', label: 'Noise' },
  { id: 'construction', emoji: '🏗', label: 'Construction' },
  { id: 'animal', emoji: '🐕', label: 'Animal' },
  { id: 'traffic', emoji: '🚦', label: 'Traffic' },
  { id: 'encroachment', emoji: '🚧', label: 'Encroachment' },
];

export type QuestionOption = { id: string; label: string };

export type Question = {
  id: QuestionId;
  text: string;
  options: QuestionOption[];
  when?: { category?: CategoryId[]; answers?: Partial<Record<QuestionId, string>> };
};

export type FlowStep = 'home' | 'category' | 'location' | 'questions' | 'map' | 'result';
