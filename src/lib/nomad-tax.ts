export interface TaxCountry {
  country: string;
  emoji: string;
  rate: number;
  dnVisa: boolean;
  notes: string;
  source: string;
}

export const TAX_DATA: TaxCountry[] = [
  { country: 'UAE', emoji: '🇦🇪', rate: 0, dnVisa: true, notes: 'No personal income tax', source: 'tax.gov.ae' },
  { country: 'Paraguay', emoji: '🇵🇾', rate: 0, dnVisa: false, notes: 'Territorial. Foreign income exempt', source: 'pwc.com' },
  { country: 'Panama', emoji: '🇵🇦', rate: 0, dnVisa: true, notes: 'Territorial. Foreign income exempt', source: 'pwc.com' },
  { country: 'Bahamas', emoji: '🇧🇸', rate: 0, dnVisa: false, notes: 'No personal income tax', source: 'bahamas.gov.bs' },
  { country: 'Georgia', emoji: '🇬🇪', rate: 1, dnVisa: true, notes: '1% on revenue under 500K GEL (Small Business Status). Excludes consulting', source: 'rs.ge' },
  { country: 'Malaysia', emoji: '🇲🇾', rate: 0, dnVisa: true, notes: 'FSI exempt if taxed abroad (extended to 2036). Otherwise 0–30% progressive', source: 'www.hasil.gov.my' },
  { country: 'Singapore', emoji: '🇸🇬', rate: 4, dnVisa: false, notes: 'Progressive 0–22%. ~4% effective at $60K USD for residents', source: 'iras.gov.sg' },
  { country: 'Greece', emoji: '🇬🇷', rate: 7, dnVisa: true, notes: '7% flat for foreign pensioners only. Standard freelancer rates: 9-44% progressive. Non-dom investor regime requires 500K+ EUR investment', source: 'aade.gr' },
  { country: 'Montenegro', emoji: '🇲🇪', rate: 13, dnVisa: true, notes: 'Progressive 0-15% since 2022. Was flat 9%. Most income above 1,000 EUR/mo taxed at 15%', source: 'gov.me' },
  { country: 'Bulgaria', emoji: '🇧🇬', rate: 10, dnVisa: false, notes: 'Flat 10%', source: 'nra.bg' },
  { country: 'Romania', emoji: '🇷🇴', rate: 35, dnVisa: true, notes: '10% income tax + 25% pension (CAS) + 10% health (CASS). Total burden ~35-45% for freelancers', source: 'anaf.ro' },
  { country: 'Serbia', emoji: '🇷🇸', rate: 10, dnVisa: false, notes: 'Flat 10% income tax', source: 'poreskauprava.gov.rs' },
  { country: 'Costa Rica', emoji: '🇨🇷', rate: 0, dnVisa: true, notes: 'Territorial. Foreign income exempt. DN visa holders pay 0% on remote work income. Local income taxed up to 25%', source: 'hacienda.go.cr' },
  { country: 'Albania', emoji: '🇦🇱', rate: 15, dnVisa: true, notes: 'Flat 15%', source: 'tatime.gov.al' },
  { country: 'Hungary', emoji: '🇭🇺', rate: 15, dnVisa: false, notes: 'Flat 15%', source: 'nav.gov.hu' },
  { country: 'Czech Republic', emoji: '🇨🇿', rate: 15, dnVisa: true, notes: 'Flat 15% (23% above ~$73K USD)', source: 'financnisprava.cz' },
  { country: 'Croatia', emoji: '🇭🇷', rate: 20, dnVisa: true, notes: '20% up to ~$60K, 30% above', source: 'porezna-uprava.hr' },
  { country: 'Estonia', emoji: '🇪🇪', rate: 22, dnVisa: true, notes: '22% flat (increased from 20% in 2025). e-Residency: only on distributed profits', source: 'emta.ee' },
  { country: 'Thailand', emoji: '🇹🇭', rate: 20, dnVisa: true, notes: 'Progressive 5–35%. Foreign income taxed if remitted while resident (180+ days)', source: 'rd.go.th' },
  { country: 'Portugal', emoji: '🇵🇹', rate: 28, dnVisa: true, notes: 'NHR ended 2024. Standard progressive up to 48%. IFICI (NHR 2.0) very limited', source: 'www.portaldasfinancas.gov.pt' },
  { country: 'Spain', emoji: '🇪🇸', rate: 24, dnVisa: true, notes: 'Beckham Law: 24% flat, 6 years. Employees + DN visa holders eligible. Standard freelancers excluded', source: 'www.agenciatributaria.es' },
  { country: 'Mexico', emoji: '🇲🇽', rate: 25, dnVisa: false, notes: 'Progressive 1.9–35%. ~25% effective at mid-income', source: 'sat.gob.mx' },
  { country: 'US', emoji: '🇺🇸', rate: 30, dnVisa: false, notes: 'Federal 10–37% + 15.3% self-employment tax', source: 'www.irs.gov' },
  { country: 'Australia', emoji: '🇦🇺', rate: 32, dnVisa: false, notes: 'Progressive 0–45%. ~32% effective at mid-income', source: 'ato.gov.au' },
  { country: 'UK', emoji: '🇬🇧', rate: 33, dnVisa: false, notes: '20–45% income tax + NI contributions', source: 'gov.uk/hmrc' },
  { country: 'Canada', emoji: '🇨🇦', rate: 33, dnVisa: false, notes: 'Federal 15–33% + provincial. ~33% combined effective', source: 'canada.ca/cra' },
  { country: 'Japan', emoji: '🇯🇵', rate: 33, dnVisa: false, notes: 'National 5–45% + municipal 10%', source: 'www.nta.go.jp' },
  { country: 'Colombia', emoji: '🇨🇴', rate: 35, dnVisa: true, notes: 'Non-residents: 35% flat on local income. Residents: 0–39% progressive', source: 'www.dian.gov.co' },
  { country: 'Netherlands', emoji: '🇳🇱', rate: 37, dnVisa: false, notes: 'Progressive 36.9–49.5% (Box 1)', source: 'belastingdienst.nl' },
  { country: 'Ireland', emoji: '🇮🇪', rate: 40, dnVisa: false, notes: '20–40% income tax + USC + PRSI', source: 'revenue.ie' },
  { country: 'Germany', emoji: '🇩🇪', rate: 42, dnVisa: false, notes: 'Progressive 14-45%. ~42% effective at mid-income. No dedicated DN visa; freelance visa (Section 21) exists but requires German clients', source: 'bzst.de' },
  { country: 'France', emoji: '🇫🇷', rate: 45, dnVisa: false, notes: 'Progressive 0–45% + social charges', source: 'impots.gouv.fr' },
  { country: 'Sweden', emoji: '🇸🇪', rate: 50, dnVisa: false, notes: 'National + municipal combined. Up to ~52%', source: 'skatteverket.se' },
  { country: 'Denmark', emoji: '🇩🇰', rate: 55, dnVisa: false, notes: 'Among highest globally. Up to ~55.9%', source: 'skat.dk' },
];
