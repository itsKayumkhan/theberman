import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import { TOWNS_BY_COUNTY_SPAIN } from '../data/spainTowns';
import { TOWNS_BY_COUNTY_ENGLAND } from '../data/englandTowns';
import { TOWNS_BY_COUNTY_FRANCE } from '../data/franceTowns';
import { TOWNS_BY_COUNTY_PORTUGAL } from '../data/portugalTowns';
import { SPAIN_NESTED } from '../data/spainTownsNested';

export const TOWNS_MAP: Record<string, Record<string, string[]>> = {
  ireland: TOWNS_BY_COUNTY,
  spain: TOWNS_BY_COUNTY_SPAIN,
  england: TOWNS_BY_COUNTY_ENGLAND,
  france: TOWNS_BY_COUNTY_FRANCE,
  portugal: TOWNS_BY_COUNTY_PORTUGAL,
};

export function getTownsForTenant(tenant: string): Record<string, string[]> {
  const data = TOWNS_MAP[tenant] || TOWNS_BY_COUNTY;
  const sorted: Record<string, string[]> = {};
  for (const county of Object.keys(data).sort()) {
    sorted[county] = [...data[county]].sort((a, b) => a.localeCompare(b, 'es'));
  }
  return sorted;
}

export function getCountiesForTenant(tenant: string): string[] {
  return Object.keys(TOWNS_MAP[tenant] || TOWNS_BY_COUNTY).sort((a, b) => a.localeCompare(b, 'es'));
}

export function getNestedTownsForTenant(tenant: string): Record<string, Record<string, string[]>> | null {
  if (tenant === 'spain') {
    const sorted: Record<string, Record<string, string[]>> = {};
    for (const community of Object.keys(SPAIN_NESTED).sort((a, b) => a.localeCompare(b, 'es'))) {
      const provinces = SPAIN_NESTED[community];
      const sortedProvinces: Record<string, string[]> = {};
      for (const province of Object.keys(provinces).sort((a, b) => a.localeCompare(b, 'es'))) {
        sortedProvinces[province] = [...provinces[province]].sort((a, b) => a.localeCompare(b, 'es'));
      }
      sorted[community] = sortedProvinces;
    }
    return sorted;
  }
  return null;
}
