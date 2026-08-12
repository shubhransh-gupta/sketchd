import { describe, it, expect } from 'vitest';
import { classifyProblem, detectEmergency } from '../engine/classifier';
import { routeComplaint } from '../engine/router';
import { resolveLocationQuery, findNearestLocation } from '../lib/location';
import { getQuestionsForCategory } from '../engine/questions';

describe('classifier', () => {
  it('detects garbage problems', () => {
    const r = classifyProblem('There is garbage dumped outside my house');
    expect(r?.category).toBe('garbage');
    expect(r?.confidence).toBe('high');
  });

  it('detects pothole problems', () => {
    const r = classifyProblem('There is a giant pothole outside my apartment');
    expect(r?.category).toBe('road');
  });

  it('detects street light issues', () => {
    const r = classifyProblem('street light not working near my house');
    expect(r?.category).toBe('street_light');
  });

  it('detects emergency keywords', () => {
    expect(detectEmergency('exposed live wire on pole', 'street_light')).toBe(true);
  });
});

describe('location', () => {
  it('resolves city name', () => {
    expect(resolveLocationQuery('Bengaluru')?.id).toBe('bengaluru');
    expect(resolveLocationQuery('bangalore')?.id).toBe('bengaluru');
  });

  it('resolves pin code', () => {
    expect(resolveLocationQuery('560001')?.id).toBe('bengaluru');
  });

  it('finds nearest supported city', () => {
    const loc = findNearestLocation(12.97, 77.59);
    expect(loc?.id).toBe('bengaluru');
  });
});

describe('router', () => {
  const bengaluru = resolveLocationQuery('Bengaluru')!;

  it('routes garbage to municipal authority', () => {
    const r = routeComplaint('garbage', bengaluru, { location_type: 'public_road' }, 'garbage on road');
    expect(r?.primary.authority.id).toBe('bbmp');
    expect(r?.primary.confidence).toBe('high');
  });

  it('routes national highway pothole to NHAI', () => {
    const r = routeComplaint('road', bengaluru, { road_type: 'national_highway' }, 'pothole on highway');
    expect(r?.primary.authority.id).toBe('nhai');
  });

  it('routes local road pothole to BBMP', () => {
    const r = routeComplaint('road', bengaluru, { road_type: 'local_road' }, 'pothole');
    expect(r?.primary.authority.id).toBe('bbmp');
  });

  it('routes delhi water to DJB', () => {
    const delhi = resolveLocationQuery('Delhi')!;
    const r = routeComplaint('water', delhi, { water_type: 'no_supply' }, 'no water');
    expect(r?.primary.authority.id).toBe('djb');
  });

  it('routes night noise to police', () => {
    const r = routeComplaint('noise', bengaluru, { noise_now: 'yes', noise_timing: 'night' }, 'loud music');
    expect(r?.primary.authority.id).toBe('karnataka-police');
  });
});

describe('questions', () => {
  it('returns road_type for road category', () => {
    const qs = getQuestionsForCategory('road', {});
    expect(qs.some((q) => q.id === 'road_type')).toBe(true);
  });

  it('skips answered questions', () => {
    const qs = getQuestionsForCategory('road', { location_type: 'public_road' });
    expect(qs.some((q) => q.id === 'location_type')).toBe(false);
  });
});
