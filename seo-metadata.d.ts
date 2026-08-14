export interface TenantHomeSeo {
  readonly title: string;
  readonly description: string;
}

export const HOME_SEO: Readonly<Record<string, TenantHomeSeo>>;
