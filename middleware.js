// Vercel Edge Middleware — Multi-tenant SEO Fix
// Injects: canonical, title, meta description, OG tags, hreflang, JSON-LD schema
// Zero changes to the React app needed.

export const config = { matcher: '/((?!assets|favicon|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)' };

// ─── Meta Conversions API (Server-Side) ───────────────────────────────────────
const META_PIXEL_ID   = '1597842568530965';
const META_CAPI_TOKEN = 'EAAYbcgkRvWkBSP6ZCtwBiQt6kELyQEQ1PkYmiRS1zORExh8AmDNJlbltZBumkpkTSb9XXqXUvEGLit8d4oGl7v9zOSYeNHwEIiAyEZC1QeZC1h8oZBCxzkIGGkvOmGiagIo481aguiO4OQeqWZBYwLe5KbVX47fF5LfhswFZAlWWdRL1fCs84epy41jrChwLiDhyQZDZD';

// SHA-256 hash helper (Edge runtime — uses Web Crypto API)
async function sha256(value) {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  const buf   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Parse a single cookie value from Cookie header string
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

async function sendMetaCAPI(eventName, eventId, req, canonicalUrl, fbc = null, fbp = null, testEventCode = null) {
  try {
    const ip     = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
    const ua     = req.headers.get('user-agent') || '';
    const cookie = req.headers.get('cookie') || '';

    // Try to extract user identifiers from cookies (set by auth/form flows)
    const rawEmail = parseCookie(cookie, 'user_email')
                  || parseCookie(cookie, 'email')
                  || parseCookie(cookie, '_user_email')
                  || parseCookie(cookie, 'contact_email');
    const rawPhone = parseCookie(cookie, 'user_phone')
                  || parseCookie(cookie, 'phone')
                  || parseCookie(cookie, '_user_phone')
                  || parseCookie(cookie, 'contact_phone');
    const rawFname = parseCookie(cookie, 'user_fname') || parseCookie(cookie, 'first_name');
    const rawLname = parseCookie(cookie, 'user_lname') || parseCookie(cookie, 'last_name');

    // Hash all available PII (Meta requires SHA-256)
    const [em, ph, fn, ln] = await Promise.all([
      sha256(rawEmail),
      sha256(rawPhone),
      sha256(rawFname),
      sha256(rawLname),
    ]);

    // fbc and fbp are now passed as parameters from the main middleware function
    // This ensures they are available both for CAPI and for setting cookies on the response

    const userData = {
      client_ip_address: ip,
      client_user_agent: ua,
      ...(em  && { em }),   // hashed email
      ...(ph  && { ph }),   // hashed phone
      ...(fn  && { fn }),   // hashed first name
      ...(ln  && { ln }),   // hashed last name
      ...(fbc && { fbc }),  // Facebook Click ID — improves match quality
      ...(fbp && { fbp }),  // Facebook Browser ID — improves match quality
    };

    const payload = {
      data: [{
        event_name:       eventName,
        event_time:       Math.floor(Date.now() / 1000),
        event_id:         eventId,
        event_source_url: canonicalUrl,
        action_source:    'website',
        user_data:        userData,
      }],
    };
    if (testEventCode) payload.test_event_code = testEventCode;

    await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
  } catch (e) {
    // Non-blocking — never fail a page load due to CAPI errors
  }
}

// ─── Page metadata map (Ireland) ─────────────────────────────────────────────
const PAGE_META_IE = {
  '/': {
    title:   "BER Certificate Ireland | Compare Quotes from SEAI Assessors",
    desc:    "Ireland's largest BER marketplace. Instantly compare quotes from trusted SEAI-registered assessors near you. Book your Building Energy Rating online today.",
    ogTitle: "Get a BER Certificate | SEAI Registered Assessors Nationwide",
    ogDesc:  "Ireland's largest BER platform. Compare quotes from trusted local assessors and book your Building Energy Rating assessment online today.",
    twTitle: "BER Certificate Ireland | Compare Quotes Instantly",
    twDesc:  "Compare BER quotes from SEAI-registered assessors nationwide. Fast, reliable, and easy to book online.",
  },
  '/about': {
    title:   "About The Berman | Ireland's BER Certificate Platform",
    desc:    "Learn about The Berman, Ireland's trusted platform connecting homeowners with 100+ SEAI-registered BER assessors across every county in Ireland.",
    ogTitle: "The Berman | SEAI Registered BER Assessor",
    ogDesc:  "Discover how The Berman connects homeowners and businesses with qualified SEAI-registered BER assessors across Ireland.",
    twTitle: "About The Berman | Trusted BER Assessor Network",
    twDesc:  "Find out how The Berman connects Irish homeowners with SEAI-registered BER assessors nationwide.",
  },
  '/about-us': {
    title:   "About The Berman | Ireland's BER Certificate Platform",
    desc:    "Learn about The Berman, Ireland's trusted platform connecting homeowners with 100+ SEAI-registered BER assessors across every county in Ireland.",
    ogTitle: "The Berman | SEAI Registered BER Assessor",
    ogDesc:  "Discover how The Berman connects homeowners and businesses with qualified SEAI-registered BER assessors across Ireland.",
    twTitle: "About The Berman | Trusted BER Assessor Network",
    twDesc:  "Find out how The Berman connects Irish homeowners with SEAI-registered BER assessors nationwide.",
  },
  '/services': {
    title:   'BER Certificate Services Ireland | Residential & Commercial | The Berman',
    desc:    'The Berman covers every step of the BER process — instant quotes, verified SEAI assessors, rating lookups and everything your property needs.',
    ogTitle: 'What We Offer | BER Certs, Ratings & Assessor Network',
    ogDesc:  'One platform, every BER service — get quotes, connect with SEAI-registered assessors and manage your Building Energy Rating with ease.',
    twTitle: 'Everything You Need for Your BER, In One Place',
    twDesc:  'One platform, every BER service — get quotes, connect with SEAI-registered assessors and manage your rating online.',
  },
  '/pricing': {
    title:   'BER Certificate Cost Ireland 2026 | Compare Prices | The Berman',
    desc:    'How much does a BER certificate cost? Compare BER cert prices from €150, based on property size and county. Get the best quote with The Berman.',
    ogTitle: 'BER Cert Cost Ireland | Compare Prices From €150',
    ogDesc:  'See real BER certificate prices by property size and county. Compare quotes from SEAI-registered assessors. The Berman makes it simple.',
    twTitle: 'BER Cert Cost Ireland 2026 | From €150',
    twDesc:  'Compare BER certificate prices by property size from SEAI-registered assessors across Ireland.',
  },
  '/faq': {
    title:   'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:    'Find answers to common questions about BER certificates, ratings, costs, validity and exemptions in Ireland. Everything you need to know.',
    ogTitle: 'BER Certificate FAQs | The Berman',
    ogDesc:  'Answers to the most common BER certificate questions in Ireland — costs, validity, exemptions, SEAI grants and more.',
    twTitle: 'BER Certificate FAQs Answered',
    twDesc:  'Common questions about BER certificates in Ireland — costs, ratings, validity and SEAI grant requirements.',
  },
  '/ber-faqs': {
    title:   'BER Certificate FAQs Ireland | Common Questions Answered | The Berman',
    desc:    'Find answers to common questions about BER certificates, ratings, costs, validity and exemptions in Ireland. Everything you need to know.',
    ogTitle: 'BER Certificate FAQs | The Berman',
    ogDesc:  'Answers to the most common BER certificate questions in Ireland — costs, validity, exemptions, SEAI grants and more.',
    twTitle: 'BER Certificate FAQs Answered',
    twDesc:  'Common questions about BER certificates in Ireland — costs, ratings, validity and SEAI grant requirements.',
  },
  '/contact-us': {
    title:   'Contact The Berman | BER Certificate Support Ireland',
    desc:    "Contact The Berman for BER certificate support. Ireland's largest BER platform — we're here to help with quotes, bookings and assessor queries.",
    ogTitle: 'Contact The Berman | Get BER Support',
    ogDesc:  "Get in touch with The Berman for quotes, bookings and BER assessor support across Ireland.",
    twTitle: 'Contact The Berman | BER Support Ireland',
    twDesc:  "Questions about your BER certificate? The Berman's team is here to help across Ireland.",
  },
  '/locations': {
    title:   'BER Assessors By County | Find Local BER Providers | The Berman',
    desc:    'Find SEAI-registered BER assessors in your county. Compare local BER certificate prices and book online with The Berman.',
    ogTitle: 'BER Assessors Near You | Search By County',
    ogDesc:  'Browse SEAI-registered BER assessors by county across Ireland. Compare local quotes and book your assessment online.',
    twTitle: 'Find Local BER Assessors By County',
    twDesc:  'Search for SEAI-registered BER assessors in your county. Compare quotes and book online with The Berman.',
  },
  '/catalogue': {
    title:   'Find BER Assessors Ireland | Browse & Compare Quotes | The Berman',
    desc:    'Browse SEAI-registered BER assessors across Ireland. Compare quotes, check availability and book your BER certificate online instantly with The Berman.',
    ogTitle: 'Find & Compare BER Assessors Near You | The Berman',
    ogDesc:  'Browse and compare SEAI-registered BER assessors in your area. Get quotes and book your BER certificate instantly online.',
    twTitle: 'Browse BER Assessors Ireland | Compare Quotes',
    twDesc:  'Find and compare SEAI-registered BER assessors near you. Book online with The Berman.',
  },
  '/news': {
    title:   'BER Certificate News & Updates Ireland | The Berman',
    desc:    'Latest BER certificate news, SEAI updates and energy rating information for Irish homeowners and landlords. Stay informed with The Berman.',
    ogTitle: 'BER News & SEAI Updates | The Berman',
    ogDesc:  'Stay up to date with the latest BER certificate news and SEAI updates in Ireland.',
    twTitle: 'BER Certificate News Ireland | The Berman',
    twDesc:  'Latest BER and SEAI updates for Irish homeowners and landlords.',
  },
  '/blog': {
    title:   'BER Certificate Blog | Energy Rating Guides Ireland | The Berman',
    desc:    'Expert guides on BER certificates, energy efficiency upgrades, SEAI grants and property energy ratings in Ireland. Read more on The Berman blog.',
    ogTitle: 'BER Certificate Guides & Resources | The Berman Blog',
    ogDesc:  'Read expert articles on BER certificates, SEAI grants, energy upgrades and property ratings in Ireland.',
    twTitle: 'BER Certificate Blog | The Berman',
    twDesc:  'Guides on BER certs, SEAI grants and energy upgrades for Irish homeowners.',
  },
  '/hire-agent': {
    title:   'Hire a BER Assessor Ireland | The Berman',
    desc:    'Hire a SEAI-registered BER assessor through The Berman. Fast, reliable and affordable BER certificates anywhere in Ireland.',
    ogTitle: 'Hire a BER Assessor | SEAI Registered | The Berman',
    ogDesc:  'Connect with a verified SEAI-registered BER assessor near you. Fast and affordable BER certificates across Ireland.',
    twTitle: 'Hire a BER Assessor | The Berman',
    twDesc:  'Find a trusted SEAI-registered BER assessor in your area. Book with The Berman today.',
  },
  '/energy-advisor': {
    title:   'BER Energy Advisor Ireland | Expert Energy Assessments | The Berman',
    desc:    'Connect with a qualified BER energy advisor in Ireland. Get expert advice on improving your property energy rating, SEAI grants and upgrade costs.',
    ogTitle: 'BER Energy Advisor | The Berman',
    ogDesc:  'Get expert BER energy advice from qualified advisors across Ireland. Understand your rating and plan energy upgrades.',
    twTitle: 'BER Energy Advisor Ireland | The Berman',
    twDesc:  'Expert energy advice for Irish homeowners. Improve your BER rating and access SEAI grants.',
  },
  '/get-quote': {
    title:   'Get a Free BER Quote | Compare Prices Instantly | The Berman',
    desc:    'Request a free BER certificate quote in minutes. Compare prices from SEAI-registered assessors near you and book online with The Berman.',
    ogTitle: 'Get Your Free BER Quote Today',
    ogDesc:  'Compare BER certificate quotes from local SEAI-registered assessors. Book your assessment online in minutes.',
    twTitle: 'Get a Free BER Quote in Minutes',
    twDesc:  'Compare BER certificate prices from SEAI-registered assessors near you. Fast and easy with The Berman.',
  },
  '/blog/ber-certificate-cost-ireland': {
    title:   'How Much Does a BER Certificate Cost in Ireland? | 2026 Price Guide',
    desc:    'BER certificate costs in Ireland range from €150–€300. Compare prices from SEAI-registered assessors near you. Get the best BER cert quote with The Berman.',
  },
  '/blog/new-ber-rating-scale-2026-ireland': {
    title:   'New BER Rating Scale 2026 — A0, A1, A2, A3 Ireland Explained | The Berman',
    desc:    "Ireland's new 2026 BER scale runs from A0 to G. Learn what each rating means, how it affects SEAI grants, and how to get your property rated under the new system.",
  },
  '/blog/ber-cert-for-landlords-ireland': {
    title:   'BER Certificate for Landlords Ireland 2026 | Legal Requirements & Costs',
    desc:    'Landlords in Ireland must have a valid BER certificate. Learn the legal requirements, costs (from €150), how long it lasts, and how to get one fast with The Berman.',
  },
  '/blog/seai-grants-2026-ireland': {
    title:   'SEAI Grants 2026 Ireland — Up to €25,000 for Home Energy Upgrades',
    desc:    'Full guide to SEAI energy upgrade grants in 2026. What grants are available, how much you can get (up to €25,000), and why you need a BER certificate to apply.',
  },
};

// ─── Page metadata map (England) ─────────────────────────────────────────────
const PAGE_META_EN = {
  '/': {
    title:   "EPC Certificate England | Energy Performance Certificate & Assessors",
    desc:    "EPCCert.com provides fast, reliable, and affordable EPC Certificates across England. Book accredited domestic and commercial energy assessments online today.",
    ogTitle: "EPCCert.com | England's Trusted EPC Certificate & Energy Assessment Provider",
    ogDesc:  "Book your EPC Certificate online with certified energy assessors across England. Fast turnaround, affordable pricing and nationwide coverage.",
    twTitle: "EPC Certificate England | Fast & Trusted Energy Performance Certificates",
    twDesc:  "Need an Energy Performance Certificate in England? Get fast, affordable EPC assessments from accredited professionals. Book online with EPCCert.",
  },
  '/about': {
    title:   'About EPCCert | Trusted EPC Certificate Experts in England',
    desc:    'Trusted EPC Certificate providers in England. EPCCert offers fast, affordable energy assessments for domestic and commercial properties across England.',
    ogTitle: 'About EPCCert | Professional EPC Certificate Services England',
    ogDesc:  'Learn how EPCCert connects property owners with accredited EPC assessors across England for fast, reliable energy performance certificates.',
    twTitle: "About EPCCert | England's Trusted EPC Certificate Provider",
    twDesc:  'Find out how EPCCert delivers trusted EPC Certificate services across England for homeowners, landlords and businesses.',
  },
  '/about-us': {
    title:   'About EPCCert | Trusted EPC Certificate Experts in England',
    desc:    'Trusted EPC Certificate providers in England. EPCCert offers fast, affordable energy assessments for domestic and commercial properties across England.',
    ogTitle: 'About EPCCert | Professional EPC Certificate Services England',
    ogDesc:  'Learn how EPCCert connects property owners with accredited EPC assessors across England for fast, reliable energy performance certificates.',
    twTitle: "About EPCCert | England's Trusted EPC Certificate Provider",
    twDesc:  'Find out how EPCCert delivers trusted EPC Certificate services across England for homeowners, landlords and businesses.',
  },
  '/services': {
    title:   'EPC Certificate Services England | Residential & Commercial | EPC Cert',
    desc:    'We provide fast, affordable Domestic and Commercial Energy Performance Certificates across England. Accredited assessors, quick turnaround, competitive pricing.',
    ogTitle: 'Professional EPC Certificate Services Across England | EPCCert',
    ogDesc:  'From domestic EPC assessments to commercial energy certificates — EPCCert covers all property types across England.',
    twTitle: 'EPC Certificate Services England | Fast & Trusted EPC Assessment',
    twDesc:  'Fast domestic and commercial EPC Certificate services across England. Accredited assessors, affordable prices.',
  },
  '/pricing': {
    title:   'EPC Certificate Cost England 2026 | Compare Prices | EPC Cert',
    desc:    'View transparent EPC Certificate pricing across England. Compare domestic and commercial EPC costs from accredited assessors. Get the best quote with EPC Cert.',
    ogTitle: 'Affordable EPC Costs Across England | Certificate for EPC',
    ogDesc:  'Compare EPC Certificate prices by property type across England. Transparent pricing from accredited assessors — book online with EPCCert.',
    twTitle: 'Fast & Affordable EPC Certificates Across England | EPCCert',
    twDesc:  'Compare EPC Certificate costs for domestic and commercial properties across England. Affordable and accredited.',
  },
  '/faq': {
    title:   'EPC Certificate FAQ England | Common Questions Answered | EPC Cert',
    desc:    'Find answers to common EPC Certificate questions in England — costs, legal requirements, timelines, Band C deadlines and landlord MEES obligations.',
    ogTitle: 'EPC Certificate FAQs | EPCCert',
    ogDesc:  'Everything you need to know about EPC Certificates in England — costs, landlord rules, MEES requirements and Band C 2030 deadline.',
    twTitle: 'EPC Certificate FAQs England Answered',
    twDesc:  'Common EPC questions for homeowners and landlords in England — costs, legal requirements and Band C obligations.',
  },
  '/epc-faq': {
    title:   'EPC Certificate FAQ England 2026 | Landlord & MEES Questions Answered',
    desc:    'Answers to common EPC questions in England — costs, landlord MEES requirements, Band C 2030 deadline, how to improve ratings, and who can carry out assessments.',
    ogTitle: 'EPC FAQs for Landlords & Homeowners England | EPCCert',
    ogDesc:  'Detailed answers to EPC Certificate questions for landlords and homeowners in England — MEES, Band C, costs and improvement tips.',
    twTitle: 'EPC FAQ England | Landlord & MEES Guide',
    twDesc:  'All your EPC questions answered — Band C deadline, MEES rules, costs and how to improve your rating in England.',
  },
  '/contact-us': {
    title:   'Contact EPCCert | Book an EPC Assessment in England',
    desc:    'Get in touch with EPC Cert for fast, reliable EPC Certificate services across England. Request a quote or book your energy assessment today.',
    ogTitle: 'Get in Touch with EPCCert | EPC Certificates England',
    ogDesc:  'Contact EPCCert to book an EPC assessment or request a quote. Fast, reliable EPC Certificate services across England.',
    twTitle: 'Contact EPCCert | Fast EPC Quotes & Support in England',
    twDesc:  'Book an EPC assessment or request a quote from EPCCert. Trusted EPC Certificate support across England.',
  },
  '/locations': {
    title:   'EPC Certificate Locations Across England | EPCCert',
    desc:    'Find trusted EPC Certificate services across England. Browse our locations and connect with accredited assessors in your area.',
    ogTitle: 'EPC Certificate Locations Across England | EPCCert',
    ogDesc:  'Browse EPC Certificate locations across England. Find accredited assessors in your area and book online with EPCCert.',
    twTitle: 'EPC Certificate Locations England | EPCCert',
    twDesc:  'Find accredited EPC assessors near you across England. Book your energy performance certificate online.',
  },
  '/catalogue': {
    title:   'Find EPC Assessors England | Browse & Compare Quotes | EPC Cert',
    desc:    'Browse accredited EPC assessors across England. Compare quotes and book your EPC certificate online instantly with EPC Cert.',
    ogTitle: 'Your Local EPC Certificate Experts Across England',
    ogDesc:  'Browse and compare accredited EPC assessors across England. Get quotes and book online with EPCCert.',
    twTitle: 'Find EPC Assessors England | EPCCert',
    twDesc:  'Compare accredited EPC assessors near you across England. Book your energy performance certificate online.',
  },
  '/news': {
    title:   'EPC Certificate News & Updates England | EPC Cert',
    desc:    'Latest EPC news, government regulations, and energy efficiency updates for English homeowners and landlords.',
    ogTitle: 'EPC News & Regulation Updates | EPCCert',
    ogDesc:  'Stay up to date with the latest EPC Certificate news, MEES changes and energy efficiency regulations in England.',
    twTitle: 'EPC Certificate News England | EPCCert',
    twDesc:  'Latest EPC and energy regulation updates for English homeowners and landlords.',
  },
  '/blog': {
    title:   'EPC Certificate Blog | Energy Efficiency Guides England | EPC Cert',
    desc:    'Expert guides on Energy Performance Certificates, home efficiency improvements, and landlord regulations in England.',
    ogTitle: 'EPC Certificate Guides & Resources | EPCCert Blog',
    ogDesc:  'Read expert articles on EPC Certificates, landlord MEES requirements and energy efficiency improvements in England.',
    twTitle: 'EPC Certificate Blog | EPCCert',
    twDesc:  'Guides on EPC certs, MEES rules and energy upgrades for English homeowners and landlords.',
  },
  '/hire-agent': {
    title:   'Hire an EPC Assessor England | EPC Cert',
    desc:    'Hire an accredited EPC assessor through EPC Cert. Fast, reliable and affordable EPC certificates anywhere in England.',
    ogTitle: 'Hire an Accredited EPC Assessor | EPCCert',
    ogDesc:  'Connect with a verified accredited EPC assessor near you. Fast and affordable EPC Certificates across England.',
    twTitle: 'Hire an EPC Assessor | EPCCert',
    twDesc:  'Find a trusted accredited EPC assessor in your area. Book with EPCCert today.',
  },
  '/energy-advisor': {
    title:   'EPC Energy Advisor England | Expert Energy Assessments | EPC Cert',
    desc:    'Connect with a qualified EPC energy advisor in England. Get expert guidance on improving your energy performance rating and meeting MEES requirements.',
    ogTitle: 'EPC Energy Advisor | EPCCert England',
    ogDesc:  'Expert EPC energy advice from qualified advisors across England. Understand your rating and plan energy improvements.',
    twTitle: 'EPC Energy Advisor England | EPCCert',
    twDesc:  'Expert energy advice for English homeowners and landlords. Improve your EPC rating and meet MEES obligations.',
  },
  '/get-quote': {
    title:   'Get a Free EPC Certificate Quote | Compare Prices England | EPC Cert',
    desc:    'Get free EPC certificate quotes from accredited assessors near you. Compare and book online instantly with EPC Cert.',
    ogTitle: 'Get Your Free EPC Quote Today | EPCCert',
    ogDesc:  'Compare EPC Certificate quotes from local accredited assessors across England. Book your assessment online in minutes.',
    twTitle: 'Get a Free EPC Quote in Minutes | EPCCert',
    twDesc:  'Compare EPC Certificate prices from accredited assessors near you. Fast and easy with EPCCert.',
  },
  // Blog posts — England
  '/blog/epc-certificate-cost-guide': {
    title:   'How Much Does an EPC Certificate Cost in England? | 2026 Price Guide',
    desc:    'EPC certificates in England cost £45–£150 for domestic properties. Compare prices from accredited assessors near you. Get your best EPC quote with EPC Cert.',
  },
  '/blog/landlord-epc-requirements-england-2026': {
    title:   'Landlord EPC Requirements England 2026 | MEES Band C 2030 Deadline Guide',
    desc:    'England MEES requires EPC Band E now; all rentals must reach Band C by 2030. Fines up to £30,000. Learn what landlords must do and how EPC Cert can help.',
  },
  '/blog/how-to-improve-epc-rating-england': {
    title:   'How to Improve Your EPC Rating England 2026 | E to C Upgrade Guide',
    desc:    'Improve your EPC rating from E to C in England. Guide to loft insulation, heat pumps, boilers & solar panels with costs, grants available, and step-by-step plan.',
  },
  '/blog/commercial-epc-england-guide': {
    title:   'Commercial EPC England 2026 | MEES Requirements, Costs & How to Comply',
    desc:    'Commercial EPCs are required when selling or renting in England. MEES demands Band C by 2030. Costs from £150. Compare commercial EPC quotes with EPC Cert.',
  },
  '/blog/epc-band-c-2030-deadline-landlord-guide': {
    title:   'EPC Band C 2030 Deadline — Landlord Action Plan England | EPC Cert',
    desc:    "All English rentals must reach EPC Band C by 2030. With fines up to £30,000, here's your step-by-step landlord action plan to comply on time and save money.",
  },
};

// ─── Page metadata map (Spain) ────────────────────────────────────────────────
const PAGE_META_ES = {
  '/': {
    title: "Certificado Energético en España | Precio desde 60€ | Técnicos Acreditados",
    desc: "¿Necesitas tu certificado energético? Compara presupuestos de técnicos acreditados en toda España. Desde 60€, visita incluida, registro oficial. Entrega en 24–72h. ¡Solicita presupuesto gratis!"
  },
  '/sobre-nosotros': {
    title: "Quiénes Somos | Plataforma Certificado Energético España | CertificadoEnergético.eu",
    desc: "Somos la plataforma que conecta propietarios con técnicos certificadores acreditados en toda España. Más de 1.000 certificados completados. Rápido, transparente y 100% oficial."
  },
  '/contacto': {
    title: "Solicita tu Certificado Energético en España | Presupuesto Gratis | Contacto",
    desc: "Solicita presupuesto gratuito para tu certificado energético. Técnicos acreditados en toda España. Visita incluida, registro oficial y entrega en 24–72h. Presupuesto sin compromiso."
  },
  '/directorio': {
    title: "Directorio Técnicos Certificado Energético España | Compara y Contrata",
    desc: "Encuentra técnicos acreditados para tu certificado energético en toda España. Compara precios, lee valoraciones y contrata profesionales colegiados. ¡Presupuesto gratis!"
  },
  '/directorio/tecnicos-certificadores': {
    title: "Directorio de Técnicos Certificadores Energéticos | España",
    desc: "Busca técnicos competentes acreditados en toda España para la emisión de Certificados de Eficiencia Energética residenciales y comerciales."
  },
  '/directorio/empresas-energia': {
    title: "Empresas de Eficiencia Energética en España | Directorio",
    desc: "Conecta con empresas de eficiencia energética en toda España: instaladores solares, expertos en aislamiento, bombas de calor y consultores de reformas."
  },
  '/asesor-energetico': {
    title: "Contrata Asesor Energético en España | Visita + Registro en 24–48h",
    desc: "Habla con un asesor energético independiente. Te ayudamos a evaluar mejoras, priorizar actuaciones y mejorar la calificación de tu inmueble. Presupuesto sin compromiso."
  },
  '/preguntas-frecuentes': {
    title: "Preguntas Frecuentes Certificado Energético España | Precios, Validez, Multas",
    desc: "¿Cuánto cuesta el certificado energético? ¿Es obligatorio para alquilar? ¿Cuánto tarda? Resolvemos todas tus dudas sobre el CEE en España. Guía completa 2026."
  },
  '/blog': {
    title: "Blog Certificado Energético España | Guías, Precios, Normativa 2026",
    desc: "Guías prácticas sobre el certificado energético en España: precios 2026, cómo mejorar tu calificación, normativa obligatoria y ayudas para reformas. Actualizado julio 2026."
  },
  '/blog/precio-certificado-energetico-espana': {
    title: "Precio del Certificado Energético en España 2026 | Guía Completa",
    desc: "Descubre cuánto cuesta el Certificado Energético en España, qué factores afectan al precio y cómo solicitar presupuesto a técnicos acreditados."
  },
  '/blog/certificado-energetico-obligatorio-espana': {
    title: "¿Cuándo es Obligatorio el Certificado Energético en España? | Guía 2026",
    desc: "Descubre cuándo es obligatorio el certificado energético en España: venta, alquiler, hipotecas, sanciones y excepciones. Guía completa actualizada 2026."
  },
  '/blog/mejorar-calificacion-energetica-vivienda': {
    title: "Cómo Mejorar la Calificación Energética de tu Vivienda | Guía Completa",
    desc: "Descubre las mejores reformas para mejorar la calificación energética de tu vivienda: aislamiento, ventanas, caldera, solar. Ayudas y subvenciones disponibles en 2026."
  },
  '/noticias': {
    title: "Noticias Certificado Energético España 2026 | Normativa y Novedades",
    desc: "Últimas noticias sobre el certificado energético en España: Orden ECM/599/2025, Directiva EPBD, obligación hipotecaria y nuevas exigencias 2030. Mantente al día."
  },
  '/ubicaciones': {
    title: "Técnicos Certificado Energético en Toda España | Ubicaciones",
    desc: "Conecta con técnicos certificadores acreditados en toda España. Compara presupuestos y organiza tu certificado energético en tu ciudad."
  }
};

// ─── County display names (Ireland) ───────────────────────────────────────────
const COUNTY_NAMES = {
  carlow:'Carlow', cavan:'Cavan', clare:'Clare', cork:'Cork', donegal:'Donegal',
  dublin:'Dublin', galway:'Galway', kerry:'Kerry', kildare:'Kildare',
  kilkenny:'Kilkenny', laois:'Laois', leitrim:'Leitrim', limerick:'Limerick',
  longford:'Longford', louth:'Louth', mayo:'Mayo', meath:'Meath',
  monaghan:'Monaghan', offaly:'Offaly', roscommon:'Roscommon', sligo:'Sligo',
  tipperary:'Tipperary', waterford:'Waterford', westmeath:'Westmeath',
  wexford:'Wexford', wicklow:'Wicklow',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toTitle(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getMeta(pathname, tenant) {
  const cleanPath = pathname.replace(/\/$/, ''); // strip trailing slash
  const activePath = cleanPath === '' ? '/' : cleanPath;

  if (tenant === 'spain') {
    if (PAGE_META_ES[activePath]) return PAGE_META_ES[activePath];

    // Check if it's a location page: /certificado-energetico-town
    const match = activePath.match(/^\/certificado-energetico-([a-z\-]+)$/);
    if (match) {
      const citySlug = match[1];
      let displayCity = toTitle(citySlug);
      if (citySlug === 'palma') displayCity = 'Palma de Mallorca';
      if (citySlug === 'las-palmas') displayCity = 'Las Palmas';
      if (citySlug === 'san-sebastian') displayCity = 'San Sebastián';
      
      return {
        title: `Certificado Energético ${displayCity} | Desde 60€ | Técnicos Acreditados`,
        desc: `Solicita tu certificado energético en ${displayCity}. Técnicos colegiados, visita presencial obligatoria incluida y entrega rápida en 24–48h. Compara presupuestos gratis.`
      };
    }
    return PAGE_META_ES['/'];
  }

  if (tenant === 'england') {
    if (PAGE_META_EN[activePath]) return PAGE_META_EN[activePath];

    // Check if it's an England location page: /epc-assessment-town
    const match = activePath.match(/^\/epc-assessment-([a-z\-]+)$/);
    if (match) {
      const citySlug = match[1];
      const displayCity = toTitle(citySlug);
      return {
        title: `EPC Certificate ${displayCity} | Domestic & Commercial EPC`,
        desc: `Need an EPC certificate in ${displayCity}? Compare quotes from local accredited assessors. Book your EPC assessment online with EPC Cert.`
      };
    }
    return PAGE_META_EN['/'];
  }

  // Ireland
  if (PAGE_META_IE[activePath]) return PAGE_META_IE[activePath];

  const parts = activePath.replace(/^\//, '').split('/');
  const county = COUNTY_NAMES[parts[0]] || toTitle(parts[0]);

  if (parts.length === 1 && COUNTY_NAMES[parts[0]]) {
    return {
      title: `BER Certificate ${county} | Compare SEAI Assessors | The Berman`,
      desc:  `Get BER certificates in County ${county}, Ireland. Compare quotes from local SEAI-registered assessors and book online. Fast, affordable BER certificates with The Berman.`,
    };
  }

  if (parts.length === 2) {
    const town = toTitle(parts[1]);
    return {
      title: `BER Certificate ${town}, ${county} | Local SEAI Assessors | The Berman`,
      desc:  `Need a BER certificate in ${town}, ${county}? Compare quotes from SEAI-registered assessors near you. Book your BER assessment online with The Berman.`,
    };
  }

  return PAGE_META_IE['/'];
}

// ─── Schema builders ─────────────────────────────────────────────────────────
function orgSchema(tenant) {
  if (tenant === 'spain') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#organization',
          name: 'Certificado Energético España',
          url: 'https://www.xn--certificadoenergtico-q2b.eu/',
          logo: 'https://www.xn--certificadoenergtico-q2b.eu/logo.png',
          areaServed: { '@type': 'Country', name: 'España' },
          knowsAbout: ['Certificado de Eficiencia Energética','Calificación Energética','Etiqueta Energética','Eficiencia Energética'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Servicios de Certificación Energética',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Vivienda' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Certificado Energético Local' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8', reviewCount: '1500', bestRating: '5', worstRating: '1',
          },
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#website',
          url: 'https://www.xn--certificadoenergtico-q2b.eu/',
          name: 'Certificado Energético',
          publisher: { '@id': 'https://www.xn--certificadoenergtico-q2b.eu/#organization' },
          inLanguage: 'es-ES',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.xn--certificadoenergtico-q2b.eu/directorio?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
  }

  if (tenant === 'england') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['Organization', 'LocalBusiness'],
          '@id': 'https://www.epccert.com/#organization',
          name: 'EPC Cert',
          url: 'https://www.epccert.com/',
          logo: 'https://www.epccert.com/logo.png',
          areaServed: { '@type': 'Country', name: 'England' },
          knowsAbout: ['EPC Certificate','Energy Performance Certificate','MEES','Domestic Energy Assessor','Commercial EPC'],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'EPC Assessment Services',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Domestic EPC Certificate' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial EPC Certificate' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Landlord EPC Certificate' } },
            ]
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9', reviewCount: '1000', bestRating: '5', worstRating: '1',
          },
          sameAs: ['https://www.facebook.com/epccert', 'https://www.instagram.com/epccert'],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.epccert.com/#website',
          url: 'https://www.epccert.com/',
          name: 'EPC Cert',
          publisher: { '@id': 'https://www.epccert.com/#organization' },
          inLanguage: 'en-GB',
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: 'https://www.epccert.com/catalogue?q={search_term_string}' },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.theberman.eu/#organization',
        name: 'The Berman',
        url: 'https://www.theberman.eu',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://www.theberman.eu/#logo',
          url: 'https://www.theberman.eu/logo.png',
          contentUrl: 'https://www.theberman.eu/logo.png',
          caption: 'The Berman',
        },
        areaServed: { '@type': 'Country', name: 'Ireland', sameAs: 'https://www.wikidata.org/wiki/Q27' },
        knowsAbout: ['Building Energy Rating','BER Certificate Ireland','SEAI','Energy Efficiency','Home Energy Assessment'],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'English', areaServed: 'IE' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Building Energy Rating Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Domestic BER Certificate' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial BER Certificate' } },
          ]
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1000',
          bestRating: '5',
          worstRating: '1',
        },
        sameAs: [
          'https://www.facebook.com/people/The-Berman/61578159843471/',
          'https://www.instagram.com/thebermanireland',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.theberman.eu/#website',
        url: 'https://www.theberman.eu/',
        name: 'The Berman',
        publisher: { '@id': 'https://www.theberman.eu/#organization' },
        inLanguage: 'en-IE',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://www.theberman.eu/catalogue?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });
}

function faqSchema(tenant) {
  if (tenant === 'spain') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': "¿Qué Es un Certificado de Eficiencia Energética?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Un <strong>Certificado de Eficiencia Energética</strong> mide el consumo de energía de un inmueble y le asigna una calificación de la A (más eficiente) a la G (menos eficiente).</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuándo Es Obligatorio el Certificado Energético en España?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Es obligatorio al vender o alquilar cualquier vivienda o local en España. Debe figurar en el anuncio inmobiliario y es imprescindible para firmar ante notario. Desde agosto de 2025, también es necesario para tasaciones hipotecarias.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Cuesta el Certificado Energético en España?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>El precio no está regulado y varía entre 60 € y 300 € según el tamaño, tipo de inmueble y ubicación. Comparar presupuestos te ayuda a encontrar la mejor opción.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Tarda en Obtenerse el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La mayoría de los certificados están disponibles en 24 a 72 horas desde la visita del técnico.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuánto Tiempo es Válido el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La validez máxima es de 10 años. Excepción: los certificados con calificación G tienen una validez de solo 5 años.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Quién Puede Emitir el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Debe ser emitido por un técnico competente habilitado (arquitecto, ingeniero o técnico cualificado oficialmente reconocido).</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Qué Pasa si Vendo mi Casa sin Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sin el certificado no podrás formalizar la venta ante notario. Además, te expones a sanciones de 300 € hasta 6.000 €.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuáles son las Multas por No Tener el Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Las sanciones por infracción leve van desde 300 € hasta 600 €. Las infracciones graves pueden llegar a 6.000 €.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Qué Significan las Letras del Certificado Energético?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>La escala va de la A (máxima eficiencia) a la G (mínima eficiencia). La Directiva EPBD exige clase mínima E en 2030 para inmuebles en alquiler.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Es Necesario el Certificado Energético para Pedir una Hipoteca?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Desde agosto de 2025, la Orden ECM/599/2025 exige un certificado energético válido para realizar tasaciones hipotecarias en España.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cómo Puedo Mejorar la Calificación Energética de mi Vivienda?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Mejoras como el aislamiento de la cubierta, ventanas eficientes, sustitución de caldera o instalación de paneles solares pueden mejorar significativamente la calificación.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Incluye el Precio el Registro en la Comunidad Autónoma?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>No siempre. Algunas comunidades cobran tasas adicionales (Cataluña, Valencia, Andalucía). En Madrid el registro es gratuito. Pide siempre un presupuesto cerrado todo incluido.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Es Obligatorio el Certificado Energético para Alquilar?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Todo propietario que quiera poner un inmueble en alquiler debe disponer de un CEE vigente antes de publicar el anuncio.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Necesita el Técnico Visitar mi Vivienda?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Es obligatorio realizar una visita presencial al inmueble. Desconfía de ofertas que no incluyan visita; son ilegales.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Mejora la Calificación Energética el Valor de mi Inmueble?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Sí. Estudios muestran que una calificación alta puede aumentar el valor de venta o alquiler entre un 5% y un 25%.</p>"
          }
        },
        {
          '@type': 'Question',
          'name': "¿Cuál es la Diferencia entre el Certificado Energético y la Cédula de Habitabilidad?",
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': "<p>Son documentos distintos. La cédula acredita habitabilidad mínima. El certificado energético mide eficiencia energética. Ambos pueden ser necesarios simultáneamente.</p>"
          }
        }
      ]
    });
  }

  if (tenant === 'england') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is an EPC Certificate?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC Certificate measures a property\'s energy efficiency and provides a rating from A to G. It also includes recommendations that may help improve energy performance.'
          }
        },
        {
          '@type': 'Question',
          'name': 'When Do I Need an EPC Certificate in England?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC is required when selling, renting or building a property in England. Landlords must have a valid EPC before marketing a rental property. An EPC is also needed to access government energy improvement grants.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Much Does an EPC Certificate Cost in England?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Domestic EPC assessments in England typically cost between £45 and £150, depending on property size, type and location. Commercial EPCs cost more — typically £150 to £1,500+. Compare quotes from multiple accredited assessors using EPC Cert to find the best price near you.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Quickly Can I Get an EPC Certificate?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Many EPC assessments can be arranged within 1–3 days. Once the assessment is completed, the certificate is issued and lodged on the official government EPC register on the same day in most cases.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How Long Is an EPC Certificate Valid?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'An EPC Certificate is generally valid for 10 years. If the certificate has expired, a new assessment will usually be required.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Who Can Carry Out an EPC Assessment?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'EPC assessments must be completed by a qualified and accredited energy assessor who is authorised to issue Energy Performance Certificates.'
          }
        }
      ]
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://theberman.eu/faq#faqpage',
    mainEntity: [
      { '@type':'Question', name:'What is a BER certificate?', acceptedAnswer:{ '@type':'Answer', text:'A Building Energy Rating (BER) certificate rates the energy performance of a home on a scale from A0 (most efficient) to G (least efficient). It is issued by a SEAI-registered assessor and is legally required when selling or renting a property in Ireland.' } },
      { '@type':'Question', name:'How long is a BER certificate valid in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'A BER certificate is valid for 10 years from the date of issue, provided no significant energy-related changes are made to the property.' } },
      { '@type':'Question', name:'How much does a BER certificate cost in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'A BER certificate in Ireland typically costs between €150 and €300, depending on property size and assessor. Use The Berman to compare quotes from multiple SEAI-registered assessors.' } },
      { '@type':'Question', name:'Do I need a BER certificate to sell my house in Ireland?', acceptedAnswer:{ '@type':'Answer', text:'Yes. A BER certificate is a legal requirement when selling or renting a residential property in Ireland. The BER rating must be displayed in all property advertisements.' } },
      { '@type':'Question', name:'How do I find a SEAI-registered BER assessor near me?', acceptedAnswer:{ '@type':'Answer', text:'Use The Berman to instantly compare quotes from over 100 SEAI-registered BER assessors across all counties in Ireland. Enter your property details to receive quotes and book online.' } },
      { '@type':'Question', name:'How long does a BER assessment take?', acceptedAnswer:{ '@type':'Answer', text:'A BER assessment typically takes 30 minutes to 2 hours depending on property size. The assessor inspects insulation, windows, heating, ventilation and any renewable energy sources.' } },
      { '@type':'Question', name:'Can I get a BER certificate for a rental property?', acceptedAnswer:{ '@type':'Answer', text:'Yes. All residential rental properties in Ireland must have a valid BER certificate. Landlords must display the BER rating in all rental advertisements.' } },
      { '@type':'Question', name:'What BER rating scale does Ireland use?', acceptedAnswer:{ '@type':'Answer', text:'As of May 2026, Ireland uses an A0 to G scale aligned with EU standards. A0 represents the most energy-efficient near-zero emission buildings, G the least efficient.' } },
      { '@type':'Question', name:'How can I improve my BER rating?', acceptedAnswer:{ '@type':'Answer', text:'Common improvements include attic or wall insulation, upgrading to an A-rated boiler or heat pump, installing double or triple-glazed windows, fitting solar panels, and improving draught-proofing. SEAI grants may be available.' } },
      { '@type':'Question', name:'What documents do I need for a BER assessment?', acceptedAnswer:{ '@type':'Answer', text:'Useful items include: property floor area, insulation details (walls, roof, floor), window and door types, heating system details (boiler age, fuel type), hot water system info, and any renewable energy systems.' } },
    ],
  });
}

function locationSchema(pathname, tenant) {
  if (tenant === 'spain') {
    const cleanPath = pathname.replace(/\/$/, '');
    const match = cleanPath.match(/^\/certificado-energetico-([a-z\-]+)$/);
    const citySlug = match ? match[1] : 'madrid';
    let displayCity = toTitle(citySlug);
    if (citySlug === 'palma') displayCity = 'Palma de Mallorca';
    if (citySlug === 'las-palmas') displayCity = 'Las Palmas';
    if (citySlug === 'san-sebastian') displayCity = 'San Sebastián';

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Certificado Energético en ${displayCity}`,
      url: `https://www.xn--certificadoenergtico-q2b.eu${pathname}`,
      provider: { '@type': 'Organization', 'name': 'Certificado Energético España' },
      areaServed: {
        '@type': 'City',
        name: displayCity,
        containedInPlace: { '@type': 'Country', name: 'España' }
      },
      serviceType: 'Certificado de Eficiencia Energética',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '60', highPrice: '300' }
    });
  }

  if (tenant === 'england') {
    const cleanPath = pathname.replace(/\/$/, '');
    const match = cleanPath.match(/^\/epc-assessment-([a-z\-]+)$/);
    const citySlug = match ? match[1] : 'london';
    const displayCity = toTitle(citySlug);

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `EPC Certificate in ${displayCity}`,
      url: `https://www.epccert.com${pathname}`,
      provider: { '@type': 'Organization', 'name': 'EPC Cert' },
      areaServed: {
        '@type': 'City',
        name: displayCity,
        containedInPlace: { '@type': 'Country', name: 'England' }
      },
      serviceType: 'Energy Performance Certificate',
      offers: { '@type': 'AggregateOffer', priceCurrency: 'GBP', lowPrice: '45', highPrice: '150' }
    });
  }

  const parts = pathname.replace(/^\//, '').split('/');
  const county = COUNTY_NAMES[parts[0]] || toTitle(parts[0]);
  const town   = parts[1] ? toTitle(parts[1]) : null;
  const location = town ? `${town}, County ${county}` : `County ${county}`;
  const url = `https://theberman.eu${pathname}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `BER Certificate in ${location}`,
    url,
    provider: { '@id': 'https://theberman.eu/#organization' },
    areaServed: {
      '@type': town ? 'City' : 'AdministrativeArea',
      name: location,
      containedInPlace: { '@type': 'Country', name: 'Ireland' },
    },
    serviceType: 'Building Energy Rating Certificate',
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: '150', highPrice: '300' },
  });
}

function breadcrumbSchema(pathname, tenant) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return null;

  let siteUrl = 'https://theberman.eu';
  if (tenant === 'spain') siteUrl = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') siteUrl = 'https://www.epccert.com';

  const homeName = tenant === 'spain' ? 'Inicio' : 'Home';

  const items = [{ '@type':'ListItem', position:1, name: homeName, item: siteUrl + '/' }];
  let current = siteUrl;
  parts.forEach((p, i) => {
    current += '/' + p;
    let name = COUNTY_NAMES[p] || toTitle(p);
    if (tenant === 'spain') {
      if (p === 'sobre-nosotros') name = 'Sobre Nosotros';
      else if (p === 'contacto') name = 'Contacto';
      else if (p === 'directorio') name = 'Directorio';
      else if (p === 'preguntas-frecuentes') name = 'Preguntas Frecuentes';
      else if (p === 'asesor-energetico') name = 'Asesor Energético';
      else if (p === 'ubicaciones') name = 'Ubicaciones';
    } else if (tenant === 'england') {
      if (p === 'about-us') name = 'About Us';
      else if (p === 'epc-faq') name = 'FAQ';
    }
    items.push({ '@type':'ListItem', position: i + 2, name, item: current });
  });
  return JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement: items });
}

// ─── Hreflang builder ────────────────────────────────────────────────────────
function hreflangTags(pathname, tenant) {
  const cleanPath = pathname === '/' ? '/' : pathname;
  const domains = [
    { lang:'en-IE', base:'https://www.theberman.eu' },
    { lang:'en-GB', base:'https://www.epccert.com' },
    { lang:'fr-FR', base:'https://dpefrance.eu' },
    { lang:'es-ES', base:'https://www.xn--certificadoenergtico-q2b.eu' },
    { lang:'pt-PT', base:'https://certificadopt.eu' },
    { lang:'x-default', base:'https://www.theberman.eu' },
  ];
  return domains.map(d =>
    `<link rel="alternate" hreflang="${d.lang}" href="${d.base}${cleanPath}" />`
  ).join('\n  ');
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function middleware(req) {
  try {
  const url  = new URL(req.url);
  const path = url.pathname;
  const testEventCode = url.searchParams.get('test_event_code') || '';

  const hostname = req.headers.get('host') || url.hostname;
  const isEsp = /certificado|xn--/.test(hostname);
  const isEng = /epccert/.test(hostname);
  const tenant = isEsp ? 'spain' : (isEng ? 'england' : 'ireland');

  // ── Extract/generate tracking IDs (needed for CAPI + cookie setting) ──
  const cookieHeader = req.headers.get('cookie') || '';

  // fbc: from cookie or from fbclid URL param
  const fbclid = url.searchParams.get('fbclid');
  const fbcCookie = parseCookie(cookieHeader, '_fbc');
  const fbc = fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null);

  // fbp: from cookie or generate server-side for first-time visitors
  const fbpCookie = parseCookie(cookieHeader, '_fbp');
  const fbp = fbpCookie || `fb.1.${Date.now()}.${Math.floor(Math.random() * 2147483647 + 1000000000)}`;

  // Handle SPA Conversions API bridge
  if (path === '/api/track-capi') {
    const eventName = url.searchParams.get('event') || 'PageView';
    const eventId = url.searchParams.get('id') || '';
    const trackPath = url.searchParams.get('path') || '/';
    const trackCanonical = `${url.protocol}//${hostname}${trackPath}`;
    
    if (tenant === 'ireland') {
      await sendMetaCAPI(eventName, eventId, req, trackCanonical, fbc, fbp, testEventCode);
    }
    const trackResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    return trackResponse;
  }

  // Handle redirects
  if (tenant === 'spain') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/sobre-nosotros`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/preguntas-frecuentes`, 301);
    if (path === '/catalogue') return Response.redirect(`${url.protocol}//${hostname}/directorio`, 301);
    if (path === '/hire-agent') return Response.redirect(`${url.protocol}//${hostname}/asesor-energetico`, 301);
    if (path === '/contact-us') return Response.redirect(`${url.protocol}//${hostname}/contacto`, 301);
  } else if (tenant === 'ireland') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/ber-faqs/`, 301);
  } else if (tenant === 'england') {
    if (path === '/about') return Response.redirect(`${url.protocol}//${hostname}/about-us`, 301);
    if (path === '/faq') return Response.redirect(`${url.protocol}//${hostname}/epc-faq`, 301);
  }

  // Dynamic robots.txt — per-tenant so each domain only references its own sitemap
  if (path === '/robots.txt') {
    let domain = 'https://www.theberman.eu';
    if (tenant === 'spain') domain = 'https://www.xn--certificadoenergtico-q2b.eu';
    else if (tenant === 'england') domain = 'https://www.epccert.com';

    const robots = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml

Disallow: /dashboard/
Disallow: /admin/
Disallow: /login/admin
Disallow: /secure-admin-portal
Disallow: /secure-admin-login
Disallow: /api/
Disallow: /membership-payment
Disallow: /registration-pending
Disallow: /assessor-terms
Disallow: /assessor-onboarding
Disallow: /business-onboarding
Disallow: /update-password

Allow: /about
Allow: /services
Allow: /pricing
Allow: /contact-us
Allow: /catalogue
Allow: /locations
Allow: /faq
Allow: /news
Allow: /hire-agent
Allow: /get-quote
Allow: /privacy
Allow: /terms
Allow: /cookie-policy
Allow: /signup
Allow: /login

Crawl-delay: 1
`;
    return new Response(robots, {
      status: 200,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }
    });
  }

  // ── Sitemap generation — sitemap index + sub-sitemaps per tenant ─────────────
  let sitemapDomain = 'https://www.theberman.eu';
  if (tenant === 'spain') sitemapDomain = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') sitemapDomain = 'https://www.epccert.com';

  const sitemapHeaders = {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  };

  // Sitemap index
  if (path === '/sitemap.xml') {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${sitemapDomain}/sitemap-pages.xml</loc>\n  </sitemap>\n  <sitemap>\n    <loc>${sitemapDomain}/sitemap-locations.xml</loc>\n  </sitemap>\n</sitemapindex>`;
    return new Response(xml, { status: 200, headers: sitemapHeaders });
  }

  // Pages sitemap
  if (path === '/sitemap-pages.xml') {
    const pages = tenant === 'spain' ? SITEMAP_PAGES_ES : tenant === 'england' ? SITEMAP_PAGES_EN : SITEMAP_PAGES_IE;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const p of pages) {
      xml += `  <url>\n    <loc>${sitemapDomain}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }
    xml += `</urlset>`;
    return new Response(xml, { status: 200, headers: sitemapHeaders });
  }

  // Locations sitemap
  if (path === '/sitemap-locations.xml') {
    const locs = tenant === 'spain' ? SITEMAP_LOCS_ES : tenant === 'england' ? SITEMAP_LOCS_EN : SITEMAP_LOCS_IE;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const l of locs) {
      xml += `  <url>\n    <loc>${sitemapDomain}${l.path}</loc>\n    <changefreq>${l.changefreq}</changefreq>\n    <priority>${l.priority}</priority>\n  </url>\n`;
    }
    xml += `</urlset>`;
    return new Response(xml, { status: 200, headers: sitemapHeaders });
  }

  // Fetch original response (proxy pattern — works on Vercel; falls back gracefully on local dev)
  let res, html;
  try {
    res  = await fetch(req);
    html = await res.text();
  } catch (_fetchErr) {
    // Local dev or fetch failure → let the global fallback return the original asset
    throw _fetchErr;
  }

  // Safety: if not HTML (e.g. API, binary) skip processing entirely
  if (!html || !html.includes('</head>')) {
    return new Response(html, { status: res.status, headers: Object.fromEntries(res.headers) });
  }

  const { title, desc, ogTitle, ogDesc, twTitle, twDesc } = getMeta(path, tenant);
  // Social tag values: fall back to page title/desc if page-specific social fields not set
  const ogTitleVal = ogTitle || title;
  const ogDescVal  = ogDesc  || desc;
  const twTitleVal = twTitle || title;
  const twDescVal  = twDesc  || desc;
  
  let canonicalBase = 'https://www.theberman.eu';
  if (tenant === 'spain') canonicalBase = 'https://www.xn--certificadoenergtico-q2b.eu';
  else if (tenant === 'england') canonicalBase = 'https://www.epccert.com';
  
  const canonical = `${canonicalBase}${path === '/' ? '/' : path}`;
  
  let ogImage = 'https://www.theberman.eu/logo.png';
  if (tenant === 'spain') ogImage = 'https://www.xn--certificadoenergtico-q2b.eu/logo.png';
  else if (tenant === 'england') ogImage = 'https://www.epccert.com/logo.png';

  // Build all schemas
  const schemas = [];
  schemas.push(`<script type="application/ld+json">${orgSchema(tenant)}</script>`);

  // FAQ schema — fires on FAQ page URLs for all tenants
  if (path === '/faq' || path === '/preguntas-frecuentes' || path === '/epc-faq' || path === '/ber-faqs' || path === '/ber-faqs/')
    schemas.push(`<script type="application/ld+json">${faqSchema(tenant)}</script>`);

  const countyKeys = Object.keys(COUNTY_NAMES);
  const parts = path.replace(/^\//, '').split('/');
  
  const isLocationIE = tenant === 'ireland' && parts.length >= 1 && countyKeys.includes(parts[0]);
  const isLocationES = tenant === 'spain' && path.startsWith('/certificado-energetico-');
  const isLocationEN = tenant === 'england' && path.startsWith('/epc-assessment-');
  
  if (isLocationIE || isLocationES || isLocationEN)
    schemas.push(`<script type="application/ld+json">${locationSchema(path, tenant)}</script>`);

  // BlogPosting schema for blog posts
  const isBlogPost = parts[0] === 'blog' && parts.length === 2;
  if (isBlogPost) {
    const { title: postTitle, desc: postDesc } = getMeta(path, tenant);
    const blogSlug = parts[1];
    const blogPosting = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postTitle,
      description: postDesc,
      url: `${canonicalBase}${path}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
    };
    schemas.push(`<script type="application/ld+json">${JSON.stringify(blogPosting)}</script>`);
  }

  // Article schema for news posts
  const isNewsPost = parts[0] === 'news' && parts.length === 2;
  if (isNewsPost) {
    const { title: newsTitle, desc: newsDesc } = getMeta(path, tenant);
    const article = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: newsTitle,
      description: newsDesc,
      url: `${canonicalBase}${path}`,
      datePublished: '2026-07-01',
      dateModified: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: tenant === 'england' ? 'EPC Cert' : 'The Berman', url: canonicalBase },
      publisher: {
        '@type': 'Organization',
        name: tenant === 'england' ? 'EPC Cert' : 'The Berman',
        logo: { '@type': 'ImageObject', url: `${canonicalBase}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${canonicalBase}${path}` },
      inLanguage: tenant === 'spain' ? 'es-ES' : tenant === 'england' ? 'en-GB' : 'en-IE',
    };
    schemas.push(`<script type="application/ld+json">${JSON.stringify(article)}</script>`);
  }

  const bc = breadcrumbSchema(path, tenant);
  if (bc) schemas.push(`<script type="application/ld+json">${bc}</script>`);

  const schemaBlock = schemas.join('\n  ');

  let locale = 'en_IE';
  let siteName = 'The Berman';
  if (tenant === 'spain') { locale = 'es_ES'; siteName = 'Certificado Energético'; }
  else if (tenant === 'england') { locale = 'en_GB'; siteName = 'EPC Cert'; }

  let gscCode = '';
  if (tenant === 'england') gscCode = 'uU6Ruam97ElN2rtvSBjwfgOUx93cCD93YRVyiBUePiw';
  else if (tenant === 'spain') gscCode = 'KoLJU_4hf55xdAgYYjqQ6ip3pK4huH5JPZj4Omhc30o';

  const gscMeta = gscCode ? `<meta name="google-site-verification" content="${gscCode}" />` : '';
  const fbMeta = tenant === 'ireland' ? '<meta name="facebook-domain-verification" content="vzxrqz9dqomp4g8iphshju59so27v8" />' : '';

  // ── Meta CAPI — determine event type based on page ───────────────────────
  let metaEventId = `mw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Contact/Lead pages
  const isContactPage = ['/contact-us', '/contacto', '/get-quote', '/hire-agent', '/asesor-energetico'].includes(path);
  // Thank-you / confirmation page = Lead
  const isThankYou = path.includes('thank') || path.includes('success') || path.includes('confirmation');
  // Catalogue / directory = ViewContent
  const isViewContent = path.startsWith('/catalogue') || path.startsWith('/directorio') || path.startsWith('/locations') || path.startsWith('/ubicaciones');
  // Blog = ViewContent
  const isBlog = path.startsWith('/blog') || path.startsWith('/noticias') || path.startsWith('/news');

  // ── Event Assignment ──────────────────────────────────────────────────────
  // IMPORTANT: Middleware fires only PageView / ViewContent on page load.
  // Lead and Contact conversion events are fired by GTM on actual form
  // submission to avoid double-counting (GTM writes cookies + fires pixel;
  // middleware reads cookies + fires CAPI on the next request).
  let metaEventName = 'PageView';
  let metaEventValue = null;
  if (isThankYou) {
    // Thank-you page = confirmed form submission → fire Lead via CAPI
    // Read the event_id that GTM wrote into a cookie so CAPI & pixel share the same ID
    const gtmEventId = parseCookie(req.headers.get('cookie') || '', 'meta_event_id');
    if (gtmEventId) metaEventId = gtmEventId;   // override middleware-generated ID with GTM's
    metaEventName = 'Lead';
    metaEventValue = { value: 150, currency: 'EUR' };
  } else if (isContactPage || isViewContent || isBlog) {
    metaEventName = 'ViewContent';
  }

  // Fire server-side CAPI — Ireland only
  if (tenant === 'ireland') {
    sendMetaCAPI(metaEventName, metaEventId, req, canonical, fbc, fbp, testEventCode);
  }

  // ── Form submission cookie setter — needed by CAPI for Lead deduplication ───
  const metaFormSnippet = tenant === 'ireland' ? `
<!-- Meta CAPI Form Dedup Helper -->
<script>
function setMetaEventId(id) {
  document.cookie = \`meta_event_id=\${id};path=/;max-age=86400\`;
}
function handleFormSubmit(event) {
  const eventId = 'form-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  setMetaEventId(eventId);
}
document.addEventListener('submit', handleFormSubmit, true);
</script>
<!-- End Meta CAPI Form Dedup Helper -->` : '';


  // GTM — inject for all tenants using each site's own container
  // IMPORTANT: Developer must remove GTM-57CD932S from the React app (it was the old hardcoded one)
  // This middleware now controls GTM for all three sites
  let gtmId = 'GTM-NK5NJ78J'; // Ireland (theberman.eu) — user's main container
  if (tenant === 'england') gtmId = 'GTM-WZVH9HVD';
  else if (tenant === 'spain') gtmId = 'GTM-TL8C5GNJ';

  // GTM — fires immediately on page load
  const gtmHead = gtmId ? `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->` : '';

  const gtmBody = gtmId ? `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->` : '';


  // ── Strip duplicate/unwanted scripts — wrapped in try/catch for safety ───────
  let cleanHtml = html;
  try {
    cleanHtml = html
      // Remove GTM-57CD932S IIFE — safe, targets specific GTM init signature only
      .replace(/\(function\(w,d,s,l,i\)\{[\s\S]*?\}\)\(window,document,'script','dataLayer','GTM-57CD932S'\);/g, '')
      // Remove GTM-57CD932S noscript — targets specific iframe src attribute
      .replace(/<noscript>\s*<iframe\s[^>]*GTM-57CD932S[^>]*><\/iframe>\s*<\/noscript>/gi, '')
      // Remove cookie-consent-wrapped scripts (type="text/plain" + data-cookieconsent)
      .replace(/<script\s[^>]*type="text\/plain"[^>]*data-cookieconsent[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<script\s[^>]*data-cookieconsent[^>]*type="text\/plain"[^>]*>[\s\S]*?<\/script>/gi, '')
      // Remove leftover cookie consent comment wrappers
      .replace(/<!--\s*Google Tag Manager \+ Meta Pixel[^-]*-->/gi, '');
  } catch (_stripErr) {
    // If stripping fails for any reason, use original HTML — never crash
    cleanHtml = html;
  }

  const injected = cleanHtml.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  ).replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${desc}" />`
  ).replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />`
  ).replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${ogTitleVal}" />`
  ).replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${ogDescVal}" />`
  ).replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonical}" />`
  ).replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${ogImage}" />`
  ).replace(
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="${locale}" />`
  ).replace(
    /<meta property="og:site_name" content="[^"]*" \/>/,
    `<meta property="og:site_name" content="${siteName}" />`
  ).replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${twTitleVal}" />`
  ).replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${twDescVal}" />`
  ).replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${ogImage}" />`
  ).replace(
    /<meta name="author" content="[^"]*" \/>/,
    `<meta name="author" content="${siteName}" />`
  ).replace(
    '</head>',
    `  <meta name="description" content="${desc}" />\n  <link rel="canonical" href="${canonical}" />\n  <meta property="og:title" content="${ogTitleVal}" />\n  <meta property="og:description" content="${ogDescVal}" />\n  <meta property="og:url" content="${canonical}" />\n  <meta property="og:image" content="${ogImage}" />\n  <meta property="og:locale" content="${locale}" />\n  <meta property="og:site_name" content="${siteName}" />\n  <meta property="og:type" content="website" />\n  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="${twTitleVal}" />\n  <meta name="twitter:description" content="${twDescVal}" />\n  <meta name="twitter:image" content="${ogImage}" />\n  ${gscMeta}\n  ${fbMeta}\n  ${hreflangTags(path, tenant)}\n  ${schemaBlock}\n  ${gtmHead}\n  ${metaFormSnippet}\n</head>`
  ).replace(
    /<body([^>]*)>/i,
    `<body$1>${gtmBody}`
  );

  const response = new Response(injected, {
    status:  res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });

  // ── Set tracking cookies for improved Meta EMQ ──
  // fbp: set for all visitors (1 year expiry) — ensures CAPI has it on every subsequent visit
  if (!fbpCookie && tenant === 'ireland') {
    response.headers.append('Set-Cookie', `_fbp=${fbp}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
  }
  // fbc: set when user arrives from a Meta ad click (90 day expiry)
  if (fbc && !fbcCookie && tenant === 'ireland') {
    response.headers.append('Set-Cookie', `_fbc=${fbc}; Path=/; Max-Age=7776000; SameSite=Lax; Secure`);
  }

  return response;
  } catch (err) {
    // If anything in this middleware fails, pass through to origin unchanged.
    // Returning undefined tells Vercel Edge to skip middleware and serve the static asset directly.
    console.error('[middleware] Error — passing through:', err);
    return undefined;
  }
}
// ─── Sitemap data — structured per-tenant pages + locations ────────────────────

// Ireland pages (from sitemap-pages.xml)
const SITEMAP_PAGES_IE = [
  { path: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/about-us',         changefreq: 'monthly', priority: '0.6' },
  { path: '/services',         changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing',          changefreq: 'monthly', priority: '0.7' },
  { path: '/catalogue',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/locations',        changefreq: 'weekly',  priority: '0.8' },
  { path: '/get-quote',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/hire-agent',       changefreq: 'monthly', priority: '0.6' },
  { path: '/ber-faqs',         changefreq: 'monthly', priority: '0.5' },
  { path: '/news',             changefreq: 'weekly',  priority: '0.5' },
  { path: '/blog',             changefreq: 'weekly',  priority: '0.5' },
  { path: '/contact-us',       changefreq: 'yearly',  priority: '0.4' },
  { path: '/privacy',          changefreq: 'yearly',  priority: '0.2' },
  { path: '/terms',            changefreq: 'yearly',  priority: '0.2' },
  { path: '/cookie-policy',    changefreq: 'yearly',  priority: '0.2' },
  { path: '/blog/ber-certificate-cost-ireland',             changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/new-ber-rating-scale-2026-ireland',        changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/ber-cert-for-landlords-ireland',           changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/seai-grants-2026-ireland',                 changefreq: 'monthly', priority: '0.6' },
];

// Ireland locations (from sitemap-locations.xml — county-level with /locations/ prefix)
const SITEMAP_LOCS_IE = [
  { path: '/locations/carlow',      changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/cavan',       changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/clare',       changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/cork',        changefreq: 'monthly', priority: '0.7' },
  { path: '/locations/donegal',     changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/dublin',      changefreq: 'monthly', priority: '0.8' },
  { path: '/locations/galway',      changefreq: 'monthly', priority: '0.7' },
  { path: '/locations/kerry',       changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/kildare',     changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/kilkenny',    changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/laois',       changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/leitrim',     changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/limerick',    changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/longford',    changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/louth',       changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/mayo',        changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/meath',       changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/monaghan',    changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/offaly',      changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/roscommon',   changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/sligo',       changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/tipperary',   changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/waterford',   changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/westmeath',   changefreq: 'monthly', priority: '0.5' },
  { path: '/locations/wexford',     changefreq: 'monthly', priority: '0.6' },
  { path: '/locations/wicklow',     changefreq: 'monthly', priority: '0.6' },
];

// England pages
const SITEMAP_PAGES_EN = [
  { path: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/about-us',         changefreq: 'monthly', priority: '0.6' },
  { path: '/services',         changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing',          changefreq: 'monthly', priority: '0.7' },
  { path: '/catalogue',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/locations',        changefreq: 'weekly',  priority: '0.8' },
  { path: '/get-quote',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/hire-agent',       changefreq: 'monthly', priority: '0.6' },
  { path: '/epc-faq',          changefreq: 'monthly', priority: '0.5' },
  { path: '/news',             changefreq: 'weekly',  priority: '0.5' },
  { path: '/blog',             changefreq: 'weekly',  priority: '0.5' },
  { path: '/contact-us',       changefreq: 'yearly',  priority: '0.4' },
  { path: '/privacy',          changefreq: 'yearly',  priority: '0.2' },
  { path: '/terms',            changefreq: 'yearly',  priority: '0.2' },
  { path: '/cookie-policy',    changefreq: 'yearly',  priority: '0.2' },
  { path: '/blog/epc-certificate-cost-guide',                 changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/landlord-epc-requirements-england-2026',     changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/how-to-improve-epc-rating-england',          changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/commercial-epc-england-guide',               changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/epc-band-c-2030-deadline-landlord-guide',    changefreq: 'monthly', priority: '0.6' },
];

// England locations
const SITEMAP_LOCS_EN = [
  { path: '/epc-assessment-london',       changefreq: 'monthly', priority: '0.8' },
  { path: '/epc-assessment-birmingham',   changefreq: 'monthly', priority: '0.7' },
  { path: '/epc-assessment-manchester',   changefreq: 'monthly', priority: '0.7' },
  { path: '/epc-assessment-leeds',        changefreq: 'monthly', priority: '0.6' },
  { path: '/epc-assessment-liverpool',    changefreq: 'monthly', priority: '0.6' },
  { path: '/epc-assessment-bristol',      changefreq: 'monthly', priority: '0.6' },
  { path: '/epc-assessment-sheffield',    changefreq: 'monthly', priority: '0.6' },
  { path: '/epc-assessment-nottingham',   changefreq: 'monthly', priority: '0.6' },
];

// Spain pages
const SITEMAP_PAGES_ES = [
  { path: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/sobre-nosotros',   changefreq: 'monthly', priority: '0.6' },
  { path: '/contacto',         changefreq: 'yearly',  priority: '0.4' },
  { path: '/directorio',       changefreq: 'weekly',  priority: '0.9' },
  { path: '/directorio/tecnicos-certificadores', changefreq: 'weekly', priority: '0.7' },
  { path: '/directorio/empresas-energia',         changefreq: 'weekly', priority: '0.7' },
  { path: '/asesor-energetico',                   changefreq: 'monthly', priority: '0.6' },
  { path: '/preguntas-frecuentes',                changefreq: 'monthly', priority: '0.5' },
  { path: '/blog',             changefreq: 'weekly',  priority: '0.5' },
  { path: '/noticias',         changefreq: 'weekly',  priority: '0.5' },
  { path: '/ubicaciones',      changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog/precio-certificado-energetico-espana',       changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/certificado-energetico-obligatorio-espana',  changefreq: 'monthly', priority: '0.6' },
  { path: '/blog/mejorar-calificacion-energetica-vivienda',   changefreq: 'monthly', priority: '0.6' },
];

// Spain locations
const SITEMAP_LOCS_ES = [
  { path: '/certificado-energetico-madrid',      changefreq: 'monthly', priority: '0.8' },
  { path: '/certificado-energetico-barcelona',   changefreq: 'monthly', priority: '0.8' },
  { path: '/certificado-energetico-valencia',    changefreq: 'monthly', priority: '0.7' },
  { path: '/certificado-energetico-sevilla',     changefreq: 'monthly', priority: '0.7' },
  { path: '/certificado-energetico-zaragoza',    changefreq: 'monthly', priority: '0.6' },
  { path: '/certificado-energetico-malaga',      changefreq: 'monthly', priority: '0.7' },
  { path: '/certificado-energetico-murcia',      changefreq: 'monthly', priority: '0.6' },
  { path: '/certificado-energetico-palma',       changefreq: 'monthly', priority: '0.5' },
  { path: '/certificado-energetico-las-palmas',  changefreq: 'monthly', priority: '0.5' },
  { path: '/certificado-energetico-bilbao',      changefreq: 'monthly', priority: '0.6' },
  { path: '/certificado-energetico-alicante',    changefreq: 'monthly', priority: '0.6' },
];
