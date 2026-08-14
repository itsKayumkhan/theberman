import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getTenantFromDomain } from '../lib/tenant';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noindex?: boolean;
    breadcrumb?: { name: string; url: string }[];
    skipSiteNameSuffix?: boolean;
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
}

const TENANT_CONFIG: Record<string, { siteName: string; baseUrl: string; ogImage: string; locale: string; currency: string; gaId: string }> = {
    spain: {
        siteName: 'Certificado Energ\u00e9tico',
        baseUrl: 'https://certificadoenergético.eu',
        ogImage: 'https://certificadoenergético.eu/logo.png',
        locale: 'es_ES',
        currency: 'EUR',
        gaId: 'G-XXXXXXXXXX',
    },
    england: {
        siteName: 'EPC Cert',
        baseUrl: 'https://www.epccert.com',
        ogImage: 'https://www.epccert.com/logo.png',
        locale: 'en_GB',
        currency: 'GBP',
        gaId: 'G-XXXXXXXXXX',
    },
    portugal: {
        siteName: 'Certificado Energia',
        baseUrl: 'https://certificadoenergia.com',
        ogImage: 'https://certificadoenergia.com/certificado-energia-logo.png',
        locale: 'pt_PT',
        currency: 'EUR',
        gaId: 'G-XXXXXXXXXX',
    },
    france: {
        siteName: 'DPE Cert France',
        baseUrl: 'https://dpecert.fr',
        ogImage: 'https://dpecert.fr/dpecert-logo.png',
        locale: 'fr_FR',
        currency: 'EUR',
        gaId: 'G-XXXXXXXXXX',
    },
    ireland: {
        siteName: 'The BER Man',
        baseUrl: 'https://www.theberman.eu',
        ogImage: 'https://www.theberman.eu/logo.svg',
        locale: 'en_IE',
        currency: 'EUR',
        gaId: 'G-BLJ6KWN29Y',
    },
};

function getTenantConfig() {
    try {
        const tenant = getTenantFromDomain();
        return TENANT_CONFIG[tenant] || TENANT_CONFIG.ireland;
    } catch {
        return TENANT_CONFIG.ireland;
    }
}

function generateBreadcrumbList(canonical: string, tenantCfg: typeof TENANT_CONFIG.ireland, items?: { name: string; url: string }[]) {
    const breadcrumbs = items || [];
    if (breadcrumbs.length === 0 && canonical && canonical !== '/') {
        const parts = canonical.replace(/^\//, '').split('/');
        let builtUrl = '';
        breadcrumbs.push({ name: 'Home', url: `${tenantCfg.baseUrl}/` });
        parts.forEach((part) => {
            builtUrl += `/${part}`;
            const name = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            breadcrumbs.push({ name, url: `${tenantCfg.baseUrl}${builtUrl}` });
        });
    } else if (breadcrumbs.length > 0) {
        // Ensure home link uses correct base URL
        breadcrumbs[0] = { ...breadcrumbs[0], url: `${tenantCfg.baseUrl}/` };
    }

    if (breadcrumbs.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

const SEOHead = ({
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    jsonLd,
    noindex = false,
    breadcrumb,
    skipSiteNameSuffix = false,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
}: SEOHeadProps) => {
    const tenantCfg = getTenantConfig();
    const siteName = tenantCfg.siteName;
    const baseUrl = tenantCfg.baseUrl;
    const defaultOgImage = tenantCfg.ogImage;
    const ogLocale = tenantCfg.locale;
    const gaId = tenantCfg.gaId;
    const resolvedOgImage = ogImage || defaultOgImage;

    const fullTitle = skipSiteNameSuffix || title.includes(siteName) ? title : `${title} | ${siteName}`;
    const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined;

    // Remove middleware-injected duplicate meta tags (they lack data-rh attribute)
    useEffect(() => {
        const selectors = [
            'meta[name="description"]',
            'meta[property="og:title"]',
            'meta[property="og:description"]',
            'meta[property="og:url"]',
            'meta[property="og:site_name"]',
            'meta[property="og:image"]',
            'meta[property="og:locale"]',
            'meta[name="twitter:card"]',
            'meta[name="twitter:title"]',
            'meta[name="twitter:description"]',
            'meta[name="twitter:image"]',
            'link[rel="canonical"]',
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (!el.hasAttribute('data-rh')) el.remove();
            });
        });
    }, [fullTitle, description, canonicalUrl]);

    // Merge BreadcrumbList with any existing jsonLd (skip if already present)
    const hasBreadcrumb = Array.isArray(jsonLd)
        ? jsonLd.some(s => s && s['@type'] === 'BreadcrumbList')
        : jsonLd && jsonLd['@type'] === 'BreadcrumbList';
    const breadcrumbSchema = hasBreadcrumb ? null : generateBreadcrumbList(canonical || '', tenantCfg, breadcrumb);
    let mergedJsonLd: Record<string, unknown> | Record<string, unknown>[] | undefined = jsonLd;
    if (breadcrumbSchema) {
        if (Array.isArray(jsonLd)) {
            mergedJsonLd = [...jsonLd, breadcrumbSchema];
        } else if (jsonLd) {
            mergedJsonLd = [jsonLd, breadcrumbSchema];
        } else {
            mergedJsonLd = breadcrumbSchema;
        }
    }

    return (
        <Helmet>
            {/* Google Analytics — tenant-specific */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script>{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}</script>
            {/* End Google Analytics */}

            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={ogTitle || fullTitle} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:site_name" content={siteName} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:image" content={resolvedOgImage} />
            <meta property="og:locale" content={ogLocale} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={twitterTitle || ogTitle || fullTitle} />
            <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
            <meta name="twitter:image" content={resolvedOgImage} />

            {/* JSON-LD Structured Data */}
            {mergedJsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(mergedJsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHead;
