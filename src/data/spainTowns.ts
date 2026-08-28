import { SPAIN_NESTED } from './spainTownsNested';

// Flatten the nested structure (Community -> Province -> Municipality) into Community -> Municipality[] for backward compatibility
const flatten: Record<string, string[]> = {};
for (const [community, provinces] of Object.entries(SPAIN_NESTED)) {
    flatten[community] = Object.values(provinces).flat();
}

export const TOWNS_BY_COUNTY_SPAIN: Record<string, string[]> = flatten;
