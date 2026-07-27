# Portugal Website Changes - Implementation README

## Source
Based on `Certificado_Energia_Portugal_Website_Changes_Report.pdf` prepared by Vanissa Leitao, 17 July 2026.

## Global Consistency Rules
- Use approved Portugal logo consistently in header and footer
- All public-facing content must be in European Portuguese
- Use "Peritos Qualificados" (not "Peritos Certificados")
- Platform is national — avoid presenting as Lisbon-only
- Confirm Portuguese phone number with Sean before publishing
- Cover mainland Portugal, Madeira and the Azores
- Test desktop, tablet and mobile layouts

## 8 Changes

### Change 1: Header Logo & Portuguese Phone Number
- **Status**: Logo already uses `/certificado-energia-logo.svg` in header
- **TODO**: Confirm correct Portuguese phone number with Sean before publishing
- **Button label**: Keep "Fale Connosco" in Portuguese

### Change 2: Homepage Image — Replace Generic Solar Image
- **Status**: Replaced generic solar-panel image references with Portugal network image
- **Rationale**: Communicates national coverage, regional search, and trusted network

### Change 3: Footer — Logo, Duplicate Text & LinkedIn
- Removed duplicate "Certificado Energia" text beside footer logo
- Linked LinkedIn icon to official Portuguese company page: `linkedin.com/company/certificados-energéticos-eu-powered-by-the-berman-portugal/`
- LinkedIn opens in new tab

### Change 4: Location Page — National Coverage
- Changed from Lisbon-only to Portugal-wide coverage
- Left content: "Encontre Peritos Qualificados em Portugal"
- Right content: Regions — Norte, Centro, Lisboa e Vale do Tejo, Alentejo, Algarve, Madeira, Açores
- Breadcrumb: Início / Portugal
- Replaced "Peritos Certificados" with "Peritos Qualificados"
- Replaced "Today" with "Hoje"

### Change 5: Final CTA — Translate to European Portuguese
- Title: "Precisa do seu certificado energético?"
- Description: "Compare orçamentos de peritos qualificados em poucos minutos."
- Button: "Pedir orçamento"

### Change 6: FAQ — Publish Verified General FAQs
- Published 7 verified general FAQs in European Portuguese
- Based on official SCE/ADENE information
- Operational FAQs (payments, cancellation, fees) remain pending Sean's confirmation
- Sources: sce.pt, adene.pt

### Change 7: Catalogue Hero — Portugal Network Image
- Replaced solar-panel background with Portugal network image
- CTA section translated to European Portuguese

### Change 8: Newsletter — Translate Subscription Block
- Title: "Fique a par das novidades"
- Description: "Subscreva para receber atualizações sobre apoios à eficiência energética, campanhas e guias técnicos."
- Input placeholder: "Endereço de e-mail"
- Button: "Subscrever"

## Developer Checklist
- [x] Replace logo in header and footer with approved Portugal logo
- [ ] Confirm Portuguese telephone number with Sean
- [x] Connect footer LinkedIn icon to official Portuguese company page
- [x] Replace generic solar-panel visuals with Portugal network images
- [x] Convert location page from Lisbon-only to Portugal-wide coverage
- [x] Translate final CTA and blog newsletter block into European Portuguese
- [x] Publish verified general FAQ content (operational questions pending)
- [x] Replace "Peritos Certificados" with "Peritos Qualificados" everywhere
- [x] Remove remaining English fragments from Portuguese version
- [ ] Test every page on desktop, tablet and mobile
