export interface TenantHomeSeo {
  readonly title: string;
  readonly description: string;
}

export interface TenantPageSeo extends TenantHomeSeo {
  readonly ogTitle: string;
  readonly ogDescription: string;
  readonly twitterTitle: string;
  readonly twitterDescription: string;
  readonly canonical: string;
}

export const HOME_SEO: Readonly<Record<string, TenantHomeSeo>>;
export const PAGE_SEO: Readonly<Record<string, Readonly<Record<string, TenantPageSeo>>>>;
