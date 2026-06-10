'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import MicroFooter from '@/components/micro-footer';
import { TelegramJobPopup } from '@/components/telegram-job-popup';
import { ArrowLeft, Search, Coins, Calendar, DollarSign, ExternalLink, X, FileText, Landmark } from 'lucide-react';

interface VisaData {
  country: string;
  flag: string;
  continent: string;
  minIncome: number; // in USD per month
  minIncomeDisplay: string;
  duration: string;
  durationDisplay: string;
  fee: string;
  taxImplications: string;
  documents: string[];
  officialUrl: string;
  description: string;
  highlights: string[];
}

const VISAS: VisaData[] = [
  {
    country: 'Spain',
    flag: '🇪🇸',
    continent: 'Europe',
    minIncome: 2800,
    minIncomeDisplay: '$2,800 / month (€2,646)',
    duration: '1 year (renewable up to 5)',
    durationDisplay: '1-5 years',
    fee: '$80 - $150',
    taxImplications: 'Eligible for "Beckhams Law" (reduced flat tax of 24% on income up to €600,000).',
    documents: [
      'Valid passport',
      'Proof of working remotely for at least 3 months prior to application',
      'Employment contract or service agreement matching Spain requirements',
      'Clean criminal record certificate',
      'Private health insurance coverage valid in Spain'
    ],
    officialUrl: 'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx',
    description: 'Spain’s digital nomad visa is one of the most popular in Europe, offering an path to residency, access to the Schengen area, and excellent tax benefits.',
    highlights: ['Path to permanent residency', 'Schengen mobility', 'Beckham’s Law tax benefits']
  },
  {
    country: 'Portugal (D8)',
    flag: '🇵🇹',
    continent: 'Europe',
    minIncome: 3500,
    minIncomeDisplay: '$3,500 / month (€3,280)',
    duration: '1 year (temporary stay) or 2 years (residency)',
    durationDisplay: '1-2 years',
    fee: '$90 - $190',
    taxImplications: 'Non-Habitual Resident (NHR) scheme is closed for new entries; standard progressive tax rates apply (up to 48%).',
    documents: [
      'Valid passport',
      'Proof of average monthly income matching Portuguese minimum wage limits',
      'Tax residency certificate',
      'Clean criminal record certificate',
      'Health insurance valid in Portugal',
      'Accommodation contract / lease in Portugal'
    ],
    officialUrl: 'https://vistos.mne.gov.pt/en/national-visas/necessary-documentation/digital-nomads',
    description: 'Portugal’s D8 visa is the ultimate choice for remote workers looking for sun, coastlines, and a established community of expats.',
    highlights: ['Two application paths available', 'Fast track to Schengen residency', 'Established expat hubs']
  },
  {
    country: 'Greece',
    flag: '🇬🇷',
    continent: 'Europe',
    minIncome: 3800,
    minIncomeDisplay: '$3,800 / month (€3,500 net)',
    duration: '1 to 2 years (renewable)',
    durationDisplay: '1-2 years',
    fee: '$85',
    taxImplications: '50% tax cut on income earned in Greece for up to 7 years (requires commitment to stay).',
    documents: [
      'Valid passport',
      'Proof of employment or contract matching the €3,500 monthly threshold (+20% for spouse, +15% per child)',
      'Clean criminal record certificate',
      'Medical certificate of good health',
      'Proof of health insurance valid in Greece'
    ],
    officialUrl: 'https://www.mfa.gr/en/visas/',
    description: 'Greece offers a generous tax discount and access to ancient culture, gorgeous islands, and Mediterranean living for remote workers.',
    highlights: ['50% tax reduction incentive', 'Schengen travel access', 'Beautiful island hubs']
  },
  {
    country: 'Croatia',
    flag: '🇭🇷',
    continent: 'Europe',
    minIncome: 2700,
    minIncomeDisplay: '$2,700 / month (€2,539)',
    duration: '1 year (non-renewable; must leave for 6 months before reapplying)',
    durationDisplay: '1 year',
    fee: '$80 - $130',
    taxImplications: '100% tax-exempt on remote income generated outside of Croatia.',
    documents: [
      'Valid passport',
      'Proof of monthly income matching Croatian baseline limits',
      'Proof of remote employment contract or contract with clients',
      'Clean criminal record check',
      'Health insurance valid in Croatia',
      'Proof of temporary accommodation address'
    ],
    officialUrl: 'https://mup.gov.hr/aliens-281686/temporary-residence-of-digital-nomads/281690',
    description: 'Croatia offers a complete tax-free experience for digital nomads and is a highly cost-effective destination in Southern Europe.',
    highlights: ['100% tax-free remote income', 'Stunning Adriatic coastline', 'Low cost of living']
  },
  {
    country: 'Malta',
    flag: '🇲🇹',
    continent: 'Europe',
    minIncome: 3800,
    minIncomeDisplay: '$3,800 / month (€3,500)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$325',
    taxImplications: 'Remote income is not taxed in Malta unless it is remitted or spent locally.',
    documents: [
      'Valid passport',
      'Employment contract or service contracts showing €3,500/mo income',
      'Clean background check',
      'Health insurance valid in Malta',
      'Rental or lease agreement in Malta'
    ],
    officialUrl: 'https://nomad.residencymalta.gov.pt/',
    description: 'Malta’s Nomad Residence Permit is ideal for English-speaking nomads seeking a sunny island base in the middle of the Mediterranean.',
    highlights: ['English speaking country', 'Schengen travel freedom', 'High-speed internet infrastructure']
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    continent: 'Europe',
    minIncome: 2700,
    minIncomeDisplay: '$2,700 / month (€2,500)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$125',
    taxImplications: 'Income tax flat reductions (up to 70-90% exemption under local tax schemes for relocated workers).',
    documents: [
      'Valid passport',
      'Proof of remote employment or freelancing for at least 6 months',
      'Clean criminal record check',
      'Health insurance valid in Italy',
      'Proof of accommodation'
    ],
    officialUrl: 'https://vistoperitalia.esteri.it/home/en',
    description: 'Italy launched its official digital nomad visa in 2024, inviting highly-skilled workers to live under the Italian sun and experience la dolce vita.',
    highlights: ['Highly-skilled worker path', 'Exquisite lifestyle & cuisine', 'Generous regional tax cuts']
  },
  {
    country: 'Estonia',
    flag: '🇪🇪',
    continent: 'Europe',
    minIncome: 4800,
    minIncomeDisplay: '$4,800 / month (€4,500)',
    duration: '1 year (extendable up to 1.5 years)',
    durationDisplay: '1-1.5 years',
    fee: '$100',
    taxImplications: 'Estonian tax residency is triggered after 183 days of stay; standard flat rate of 20% applies.',
    documents: [
      'Valid passport',
      'Employment contract showing remote work capacity',
      'Bank statements matching the €4,500/mo income threshold',
      'Health insurance covering Estonia'
    ],
    officialUrl: 'https://www.e-resident.gov.ee/nomadvisa/',
    description: 'Estonia was the first country in the world to launch a digital nomad visa, integrated with their famous E-residency ecosystem.',
    highlights: ['Pioneer digital society', 'Fully electronic application portal', 'E-residency integrations']
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    continent: 'Asia',
    minIncome: 5500,
    minIncomeDisplay: '$5,500 / month ($65k/year)',
    duration: '6 months (non-renewable)',
    durationDisplay: '6 months',
    fee: '$30',
    taxImplications: 'Remote income is tax-exempt for the 6-month duration of the stay.',
    documents: [
      'Valid passport',
      'Tax residency certificate or proof of income matching 10M JPY/year',
      'Health insurance with coverage of at least 10M JPY',
      'Employment contract or service agreements'
    ],
    officialUrl: 'https://www.mofa.go.jp/ca/fna/pagew_000001_00046.html',
    description: 'Japan’s digital nomad visa allows remote workers from 49 visa-exempt countries to live and work in Japan tax-free for up to six months.',
    highlights: ['Tax-free stay', 'Live in Tokyo/Kyoto', 'Straightforward application']
  },
  {
    country: 'Thailand (DTV)',
    flag: '🇹🇭',
    continent: 'Asia',
    minIncome: 0,
    minIncomeDisplay: '$13,600 bank balance (no monthly income minimum)',
    duration: '5 years (180 days per entry, extendable)',
    durationDisplay: '5 years',
    fee: '$300 (10,000 THB)',
    taxImplications: 'Taxation applies only to income brought into Thailand during the same tax year; foreign income is generally tax-free.',
    documents: [
      'Valid passport',
      'Proof of funds / bank balance showing at least 500,000 THB (~$13.6k)',
      'Employment contract or proof of business registration',
      'Portfolio of work or professional credentials'
    ],
    officialUrl: 'https://thaievisa.go.th/',
    description: 'Thailand’s Destination Thailand Visa (DTV) is one of the most competitive visas in the world, allowing 5 years of multiple entries for remote workers.',
    highlights: ['5-year validity period', 'No monthly income minimum', 'Extremely low application fee']
  },
  {
    country: 'Malaysia (DE Rantau)',
    flag: '🇲🇾',
    continent: 'Asia',
    minIncome: 2000,
    minIncomeDisplay: '$2,000 / month ($24k/year)',
    duration: '1 to 2 years (renewable)',
    durationDisplay: '1-2 years',
    fee: '$215 (spouse +$85)',
    taxImplications: 'Remote income generated outside of Malaysia is tax-exempt.',
    documents: [
      'Valid passport',
      'Proof of income showing $24,000+ USD annual salary',
      'Remote work contract or active freelance client contracts',
      'Clean criminal record check',
      'Health insurance valid in Malaysia'
    ],
    officialUrl: 'https://mdec.my/derantau',
    description: 'Malaysia’s DE Rantau program offers a robust digital nomad ecosystem, low cost of living, and an officially recognized network of nomad hubs.',
    highlights: ['Official nomad hub discounts', 'Tax-free remote income', 'Very low income threshold']
  },
  {
    country: 'Colombia',
    flag: '🇨🇴',
    continent: 'South America',
    minIncome: 1000,
    minIncomeDisplay: '$1,000 / month (3x SMMLV)',
    duration: 'Up to 2 years',
    durationDisplay: '2 years',
    fee: '$230',
    taxImplications: 'Nomads are subject to Colombian tax after 183 days; foreign income might be taxed if tax residency is triggered.',
    documents: [
      'Valid passport',
      'Proof of remote work for foreign company or freelance contracts',
      'Bank statements proving minimum income equivalent to 3x Colombian minimum wage',
      'Health insurance policy valid in Colombia with digital nomad coverage'
    ],
    officialUrl: 'https://www.cancilleria.gov.co/tramites_servicios/visa',
    description: 'Colombia’s digital nomad visa is highly affordable and allows remote workers to experience the vibrant culture, coffee regions, and diverse cities for up to two years.',
    highlights: ['Very low income requirement', 'Stunning biodiversity & culture', 'Valid for up to 2 years']
  },
  {
    country: 'South Korea (Workation)',
    flag: '🇰🇷',
    continent: 'Asia',
    minIncome: 5500,
    minIncomeDisplay: '$5,500 / month ($65k/year)',
    duration: '1 year (renewable up to 2 years)',
    durationDisplay: '1-2 years',
    fee: '$200',
    taxImplications: 'Income from foreign sources is generally not taxed in South Korea during the workation period.',
    documents: [
      'Valid passport',
      'Employment contract showing remote work capacity for a foreign company',
      'Certificate of income proving GNI per capita threshold (double the Korean average GNI)',
      'Clean criminal background check',
      'Private health insurance covering at least 100 million KRW'
    ],
    officialUrl: 'https://www.visa.go.kr/',
    description: 'South Korea’s official Workation Visa allows highly skilled remote workers to experience the mix of traditional history and futuristic lifestyle in cities like Seoul or Busan.',
    highlights: ['Fast internet infrastructure', 'Sleek modern cities', 'Explore K-Culture']
  },
  {
    country: 'Indonesia (E33G)',
    flag: '🇮🇩',
    continent: 'Asia',
    minIncome: 5000,
    minIncomeDisplay: '$5,000 / month ($60k/year)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$450',
    taxImplications: 'Remote workers are exempt from Indonesian income taxes on foreign source income under specific conditions.',
    documents: [
      'Valid passport (minimum 6 months validity)',
      'Proof of income showing at least $60,000 USD annual remote salary',
      'Employment contract with a company based outside Indonesia',
      'Bank statements showing the last 3 months of deposits'
    ],
    officialUrl: 'https://evisa.imigrasi.go.id/',
    description: 'The Indonesian E33G Remote Worker visa is a dedicated route for digital nomads looking to legally reside and work remotely in Bali and other stunning parts of the archipelago.',
    highlights: ['Perfect for Bali workations', 'Tax exemption on remote income', 'Renewable stay paths']
  },
  {
    country: 'Dubai (UAE)',
    flag: '🇦🇪',
    continent: 'Asia',
    minIncome: 5000,
    minIncomeDisplay: '$5,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$350',
    taxImplications: 'Zero personal income tax in the UAE on all remote and foreign-sourced income.',
    documents: [
      'Valid passport (minimum 6 months validity)',
      'Proof of employment with a contract valid for one year minimum',
      'Last month pay slip and 3 months of bank statements matching income requirement',
      'Proof of company ownership (if business owner/freelancer)'
    ],
    officialUrl: 'https://www.visitdubai.com/en/business-in-dubai/visa-and-entry/work-remotely-from-dubai',
    description: 'Dubai’s Virtual Working Programme offers a tax-free hub with world-class coworking infrastructure, high safety standards, and excellent global travel connectivity.',
    highlights: ['100% tax-free income', 'World-class tech infrastructure', 'High safety & standard of living']
  },
  {
    country: 'Costa Rica',
    flag: '🇨🇷',
    continent: 'North America',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '1 year (renewable once)',
    durationDisplay: '1-2 years',
    fee: '$100',
    taxImplications: 'Exempt from Costa Rican income taxes on all foreign-sourced remote income.',
    documents: [
      'Valid passport',
      'Bank statements proving average monthly income of $3,000 USD (or $4,000 for families) for the past year',
      'Proof of remote work or business ownership outside Costa Rica',
      'Medical insurance policy covering at least $50,000 USD valid in Costa Rica'
    ],
    officialUrl: 'https://www.visitcostarica.com',
    description: 'Costa Rica’s digital nomad visa is perfect for nature lovers seeking a tropical workspace, offering tax exemptions and easy extensions for remote workers.',
    highlights: ['Pura Vida lifestyle', 'Tax-free remote income', 'Beautiful beaches & rainforests']
  },
  {
    country: 'Mexico (Temporary Resident)',
    flag: '🇲🇽',
    continent: 'North America',
    minIncome: 2600,
    minIncomeDisplay: '$2,600 / month (or $43k savings)',
    duration: '1 to 4 years',
    durationDisplay: '1-4 years',
    fee: '$200',
    taxImplications: 'Foreign source income is not taxed in Mexico as long as you do not trigger local business/employment operations.',
    documents: [
      'Valid passport',
      'Proof of average monthly income of ~$2,600 USD or bank savings balance of ~$43,000 USD over the last 12 months',
      'Application form and interview at a Mexican consulate abroad',
      'Fee payment receipt'
    ],
    officialUrl: 'https://www.gob.mx/inm',
    description: 'Mexico does not have a dedicated digital nomad visa, but its highly popular Temporary Resident Visa serves as the primary route for remote workers looking to stay for up to 4 years.',
    highlights: ['Very high savings alternative', 'Vibrant food and culture', 'Valid for up to 4 years']
  },
  {
    country: 'Brazil',
    flag: '🇧🇷',
    continent: 'South America',
    minIncome: 1500,
    minIncomeDisplay: '$1,500 / month (or $18k savings)',
    duration: '1 year (renewable up to 2 years)',
    durationDisplay: '1-2 years',
    fee: '$150',
    taxImplications: 'You become a tax resident in Brazil after 183 days of physical presence, which triggers taxes on global income.',
    documents: [
      'Valid passport',
      'Remote work contract or freelance declaration for foreign company',
      'Bank statements proving $1,500/mo income or $18,000 savings balance',
      'Clean criminal record certificate',
      'Health insurance valid in Brazil'
    ],
    officialUrl: 'https://www.gov.br/mre',
    description: 'Brazil’s VITEM XIV visa is a highly cost-effective option for nomads looking to experience South America, featuring beautiful coastlines, rainforests, and low cost of living.',
    highlights: ['Savings option available', 'Cost-effective living', 'Lively coastal & city hubs']
  },
  {
    country: 'Iceland',
    flag: '🇮🇸',
    continent: 'Europe',
    minIncome: 7000,
    minIncomeDisplay: '$7,000 / month',
    duration: '180 days (non-renewable)',
    durationDisplay: '180 days',
    fee: '$90',
    taxImplications: 'Exempt from Icelandic tax if you stay less than 183 days (the maximum duration of the visa anyway).',
    documents: [
      'Valid passport',
      'Proof of employment or contracts indicating remote work outside Iceland',
      'Bank statements matching the 1,000,000 ISK monthly income threshold',
      'Proof of health insurance valid in Iceland'
    ],
    officialUrl: 'https://island.is',
    description: 'Iceland’s remote work visa allows high-earning nomads from visa-exempt countries to spend up to 6 months exploring glaciers, hot springs, and volcanic landscapes.',
    highlights: ['Breathtaking natural landscapes', 'Exempt from Icelandic income tax', 'Straightforward application']
  },
  {
    country: 'Hungary (White Card)',
    flag: '🇭🇺',
    continent: 'Europe',
    minIncome: 3200,
    minIncomeDisplay: '$3,200 / month',
    duration: '1 year (renewable once)',
    durationDisplay: '1-2 years',
    fee: '$120',
    taxImplications: 'Hungarian tax residency triggers after 183 days, subject to a flat 15% income tax rate.',
    documents: [
      'Valid passport',
      'Proof of remote employment for a company outside Hungary or freelance business contracts',
      'Bank statements showing the €3,000 monthly minimum income for the past 6 months',
      'Health insurance valid in Hungary'
    ],
    officialUrl: 'https://oif.gov.hu',
    description: 'Hungary’s White Card offers digital nomads a highly central European base in Budapest, with low cost of living, high-speed internet, and access to the Schengen zone.',
    highlights: ['Budapest nomad lifestyle', 'Schengen travel freedom', 'Low cost of living']
  },
  {
    country: 'South Africa',
    flag: '🇿🇦',
    continent: 'Africa',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$150',
    taxImplications: 'Exempt from South African income tax for the first 36 months if registered as a remote worker from a foreign employer.',
    documents: [
      'Valid passport',
      'Proof of employment contract with a foreign company',
      'Bank statements showing gross annual income of at least 650,796 ZAR',
      'Health insurance valid in South Africa',
      'Accommodation booking or lease'
    ],
    officialUrl: 'https://www.dha.gov.za',
    description: 'South Africa’s new Remote Work Visitor Visa allows digital nomads to live in beautiful hubs like Cape Town and Johannesburg while enjoying zero tax on remote income.',
    highlights: ['Stunning Cape Town hubs', 'Zero local income tax initially', 'Great lifestyle and weather']
  },
  {
    country: 'Cyprus',
    flag: '🇨🇾',
    continent: 'Europe',
    minIncome: 3800,
    minIncomeDisplay: '$3,800 net / month',
    duration: '1 year (renewable up to 3 years)',
    durationDisplay: '1-3 years',
    fee: '$75',
    taxImplications: 'Non-domicile tax residents enjoy exemptions on dividend and interest income in Cyprus.',
    documents: [
      'Valid passport',
      'Employment contracts or freelance agreements outside Cyprus',
      'Bank statements proving net monthly income of €3,500 (+20% for spouse, +15% per child)',
      'Clean criminal record certificate',
      'Health insurance valid in Cyprus'
    ],
    officialUrl: 'http://www.moi.gov.cy/crmd',
    description: 'Cyprus offers digital nomads an attractive Mediterranean island base, a highly favorable tax system, and up to three years of legal residency.',
    highlights: ['Favorable non-domicile tax scheme', 'Sunny Mediterranean beaches', 'Strong English-speaking environment']
  },
  {
    country: 'Romania',
    flag: '🇷🇴',
    continent: 'Europe',
    minIncome: 3900,
    minIncomeDisplay: '$3,900 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1-2 years',
    fee: '$100',
    taxImplications: 'Romania does not tax foreign remote income if you remain a tax resident of another country.',
    documents: [
      'Valid passport',
      'Employment contract with a foreign company or business ownership documents',
      'Bank statements showing at least €3,600/mo income for the past 3 months',
      'Clean criminal record check',
      'Medical insurance valid in Romania'
    ],
    officialUrl: 'https://evisa.mae.ro',
    description: 'Romania offers one of the fastest internet networks in Europe, low cost of living, and a straightforward digital nomad visa route.',
    highlights: ['Ultra-fast internet speeds', 'Very low cost of living', 'Explore Transylvania and cities']
   },
  {
    country: 'Germany (Freelance)',
    flag: '🇩🇪',
    continent: 'Europe',
    minIncome: 0,
    minIncomeDisplay: 'No fixed minimum (sufficient funds required)',
    duration: 'Up to 3 years (renewable)',
    durationDisplay: '1-3 years',
    fee: '$100',
    taxImplications: 'Subject to German income tax as a tax resident; progressive rates up to 45%.',
    documents: [
      'Valid passport',
      'Proof of freelance activity (client contracts, portfolio)',
      'Financial plan or proof of sufficient income',
      'Health insurance valid in Germany',
      'Proof of accommodation in Germany'
    ],
    officialUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/self-employment',
    description: 'Germany\'s Freelance Visa (Freiberufler) is ideal for self-employed remote workers and freelancers seeking access to Europe\'s largest economy and the Schengen area.',
    highlights: ['Path to permanent residency', 'Schengen travel freedom', 'Strong tech ecosystem']
  },
  {
    country: 'Czech Republic (Živno)',
    flag: '🇨🇿',
    continent: 'Europe',
    minIncome: 0,
    minIncomeDisplay: '~$6,600 in savings (no monthly minimum)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$120',
    taxImplications: 'Subject to Czech flat tax rate of 15% on income; lump-sum expense deductions available for freelancers.',
    documents: [
      'Valid passport',
      'Proof of savings (~CZK 150,000)',
      'Trade license (Živnostenský list) registration',
      'Proof of accommodation in Czech Republic',
      'Clean criminal record certificate'
    ],
    officialUrl: 'https://www.mvcr.cz/mvcren/article/third-country-nationals-702950.aspx',
    description: 'The Czech Živnostenský (trade license) visa is a popular route for freelancers and digital nomads to base themselves in Prague, one of Europe\'s most affordable and beautiful capital cities.',
    highlights: ['Affordable Prague lifestyle', 'Schengen access', 'Freelancer-friendly tax regime']
  },
  {
    country: 'Latvia',
    flag: '🇱🇻',
    continent: 'Europe',
    minIncome: 2850,
    minIncomeDisplay: '$2,850 / month (€2,700)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$100',
    taxImplications: 'Micro-enterprise tax of 25% on turnover up to €25,000; standard progressive rates above.',
    documents: [
      'Valid passport',
      'Proof of remote employment or freelance contracts',
      'Bank statements matching income threshold',
      'Health insurance valid in Latvia',
      'Proof of accommodation in Latvia'
    ],
    officialUrl: 'https://www.pmlp.gov.lv/en',
    description: 'Latvia offers digital nomads a gateway to the Baltics with Riga\'s vibrant startup scene, fast internet, and affordable European living.',
    highlights: ['Vibrant Baltic startup hub', 'Affordable cost of living', 'Schengen zone access']
  },
  {
    country: 'Montenegro',
    flag: '🇲🇪',
    continent: 'Europe',
    minIncome: 0,
    minIncomeDisplay: 'No fixed minimum (proof of remote work required)',
    duration: '2 years',
    durationDisplay: '2 years',
    fee: '$55',
    taxImplications: 'Flat personal income tax rate of 9-15% depending on income; foreign income may be exempt if not a tax resident.',
    documents: [
      'Valid passport',
      'Proof of remote work for foreign company',
      'Proof of accommodation in Montenegro',
      'Health insurance valid in Montenegro',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.gov.me/en/mup',
    description: 'Montenegro\'s digital nomad permit offers stunning Adriatic coastline, extremely low taxes, and a rapidly developing infrastructure at bargain prices.',
    highlights: ['Very low application fee', 'Stunning Adriatic coastline', 'Flat 9% income tax']
  },
  {
    country: 'Albania',
    flag: '🇦🇱',
    continent: 'Europe',
    minIncome: 0,
    minIncomeDisplay: 'No fixed minimum income',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$50',
    taxImplications: 'Digital nomads on the visa are exempt from Albanian income tax on foreign-sourced income.',
    documents: [
      'Valid passport',
      'Proof of remote work or freelance contracts',
      'Proof of health insurance',
      'Clean criminal record',
      'Proof of accommodation in Albania'
    ],
    officialUrl: 'https://e-albania.al',
    description: 'Albania launched its digital nomad visa to attract remote workers to its beautiful Mediterranean coastline, with no minimum income requirement and tax-free foreign income.',
    highlights: ['No minimum income', 'Tax-free foreign income', 'Affordable Mediterranean living']
  },
  {
    country: 'Slovenia',
    flag: '🇸🇮',
    continent: 'Europe',
    minIncome: 2180,
    minIncomeDisplay: '$2,180 / month (€2,062)',
    duration: '1 year (renewable once)',
    durationDisplay: '1-2 years',
    fee: '$110',
    taxImplications: 'Progressive income tax rates from 16-50%; non-residents taxed only on Slovenian-source income.',
    documents: [
      'Valid passport',
      'Proof of employment or freelance work for a foreign entity',
      'Proof of monthly income meeting threshold',
      'Health insurance valid in Slovenia',
      'Proof of accommodation'
    ],
    officialUrl: 'https://www.gov.si/en/topics/entry-and-residence/',
    description: 'Slovenia offers digital nomads access to Ljubljana\'s charming city life, Alpine scenery, and a strategic location in the heart of Europe with full Schengen access.',
    highlights: ['Alpine & Mediterranean mix', 'Schengen travel freedom', 'High quality of life']
  },
  {
    country: 'Serbia',
    flag: '🇷🇸',
    continent: 'Europe',
    minIncome: 0,
    minIncomeDisplay: 'No fixed monthly minimum',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$100',
    taxImplications: 'Flat income tax of 10% for residents; digital nomads may be exempt on foreign-sourced income if not a tax resident.',
    documents: [
      'Valid passport',
      'Proof of remote employment for a company registered outside Serbia',
      'Proof of accommodation in Serbia',
      'Health insurance',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.mfa.gov.rs/en',
    description: 'Serbia\'s digital nomad program attracts remote workers to Belgrade\'s vibrant nightlife and tech scene, offering one of the lowest costs of living in Europe.',
    highlights: ['No minimum income', 'Flat 10% tax rate', 'Ultra-low cost of living']
  },
  {
    country: 'Bulgaria',
    flag: '🇧🇬',
    continent: 'Europe',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$110',
    taxImplications: 'Flat income tax rate of 10% — one of the lowest in the EU.',
    documents: [
      'Valid passport',
      'Proof of remote employment with a non-Bulgarian company',
      'Bank statements showing sufficient income',
      'Health insurance valid in Bulgaria',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.mfa.bg/en/',
    description: 'Bulgaria\'s digital nomad visa pairs one of Europe\'s lowest flat tax rates (10%) with extremely affordable living and access to both mountains and Black Sea coastline.',
    highlights: ['Flat 10% income tax', 'Cheapest EU country', 'Mountains & Black Sea']
  },
  {
    country: 'Norway (Svalbard)',
    flag: '🇳🇴',
    continent: 'Europe',
    minIncome: 4800,
    minIncomeDisplay: '$4,800 / month',
    duration: '2 years (renewable)',
    durationDisplay: '2 years',
    fee: '$650',
    taxImplications: 'Svalbard has no income tax; mainland Norway has progressive rates from 22-47.4%.',
    documents: [
      'Valid passport',
      'Proof of remote employment contract',
      'Documentation of sufficient income/savings',
      'Health insurance',
      'Proof of accommodation'
    ],
    officialUrl: 'https://www.udi.no/en/',
    description: 'Norway offers independent contractor visas for remote workers, with the unique option of tax-free living on Svalbard for those seeking an Arctic adventure.',
    highlights: ['Tax-free on Svalbard', 'Northern Lights & fjords', 'High standard of living']
  },
  {
    country: 'Georgia',
    flag: '🇬🇪',
    continent: 'Asia',
    minIncome: 2000,
    minIncomeDisplay: '$2,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: 'Free',
    taxImplications: 'Foreign-sourced income is tax-free in Georgia; only locally-sourced income is taxed at 20%.',
    documents: [
      'Valid passport',
      'Proof of remote work or freelance activity',
      'Bank statements showing $2,000/month income for last 6 months',
      'Health insurance covering Georgia',
      'Clean criminal record'
    ],
    officialUrl: 'https://stopcov.ge/en/remotely-from-georgia',
    description: 'Georgia\'s "Remotely from Georgia" program is one of the most generous digital nomad schemes, with zero tax on foreign income, no visa fee, and a beautiful Caucasus setting.',
    highlights: ['Zero tax on foreign income', 'No visa fee', 'Stunning Caucasus scenery']
  },
  {
    country: 'Turkey',
    flag: '🇹🇷',
    continent: 'Asia',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$100',
    taxImplications: 'Remote income earned outside Turkey is generally not taxed if you stay under 183 days; otherwise progressive rates apply.',
    documents: [
      'Valid passport',
      'Proof of remote employment or freelance contracts',
      'Bank statements showing consistent income',
      'Health insurance valid in Turkey',
      'Proof of accommodation'
    ],
    officialUrl: 'https://e-ikamet.goc.gov.tr',
    description: 'Turkey offers digital nomads an affordable lifestyle with world-class food, historic cities like Istanbul and Antalya, and a rapidly growing remote work infrastructure.',
    highlights: ['Affordable living costs', 'Rich cultural experience', 'Strategic Europe-Asia location']
  },
  {
    country: 'Taiwan (Gold Card)',
    flag: '🇹🇼',
    continent: 'Asia',
    minIncome: 5350,
    minIncomeDisplay: '$5,350 / month (NTD 160k)',
    duration: '1-3 years',
    durationDisplay: '1-3 years',
    fee: '$100-$310',
    taxImplications: 'First 3 years: 50% tax exemption on salary income over NTD 3M; standard progressive rates (5-40%) apply after.',
    documents: [
      'Valid passport',
      'Proof of income meeting salary threshold in relevant field',
      'Professional credentials (patents, publications, or senior-level work history)',
      'Health check certificate'
    ],
    officialUrl: 'https://goldcard.nat.gov.tw/en/',
    description: 'Taiwan\'s Employment Gold Card is a combined work permit and visa for skilled professionals, offering an incredible quality of life, safety, and one of Asia\'s best tech ecosystems.',
    highlights: ['50% tax exemption for 3 years', 'World-class tech ecosystem', 'Excellent food & safety']
  },
  {
    country: 'Sri Lanka',
    flag: '🇱🇰',
    continent: 'Asia',
    minIncome: 2000,
    minIncomeDisplay: '$2,000 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$250',
    taxImplications: 'Remote income from foreign sources is not taxed in Sri Lanka under the digital nomad visa.',
    documents: [
      'Valid passport (minimum 6 months validity)',
      'Proof of remote employment or freelance work',
      'Bank statements proving minimum income',
      'Health insurance valid in Sri Lanka',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.immigration.gov.lk',
    description: 'Sri Lanka\'s digital nomad visa offers tropical beaches, ancient temples, and an incredibly low cost of living for remote workers seeking an exotic Asian base.',
    highlights: ['Tax-free foreign income', 'Beautiful tropical setting', 'Very affordable living']
  },
  {
    country: 'Mauritius',
    flag: '🇲🇺',
    continent: 'Africa',
    minIncome: 1500,
    minIncomeDisplay: '$1,500 / month',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: 'Free',
    taxImplications: 'Flat 15% tax rate, but foreign-sourced income is not taxed if earned outside Mauritius.',
    documents: [
      'Valid passport',
      'Proof of remote employment or self-employment',
      'Bank statements showing minimum income',
      'Health insurance covering Mauritius',
      'Travel itinerary and accommodation proof'
    ],
    officialUrl: 'https://www.edbmauritius.org/premium-visa',
    description: 'Mauritius\' Premium Travel Visa offers digital nomads a tropical Indian Ocean paradise with no visa fees, low income requirements, and zero tax on foreign income.',
    highlights: ['No visa fee', 'Tax-free foreign income', 'Indian Ocean paradise']
  },
  {
    country: 'Cabo Verde',
    flag: '🇨🇻',
    continent: 'Africa',
    minIncome: 1500,
    minIncomeDisplay: '$1,500 / month (or €1,400)',
    duration: '6 months (renewable up to 1 year)',
    durationDisplay: '6-12 months',
    fee: '$100',
    taxImplications: 'Remote workers are exempt from local income taxes on foreign-sourced income.',
    documents: [
      'Valid passport',
      'Proof of remote work contract or freelance activity',
      'Proof of income or savings',
      'Health insurance',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.governo.cv',
    description: 'Cape Verde\'s Remote Working visa invites digital nomads to work from volcanic Atlantic islands with year-round warm weather, great surf, and a relaxed pace of life.',
    highlights: ['Tax-free remote income', 'Year-round warm weather', 'Atlantic island vibes']
  },
  {
    country: 'Argentina',
    flag: '🇦🇷',
    continent: 'South America',
    minIncome: 0,
    minIncomeDisplay: 'No minimum income requirement',
    duration: '6 months (renewable for 6 more)',
    durationDisplay: '6-12 months',
    fee: '$200',
    taxImplications: 'Exempt from Argentine income tax for up to 12 months under the digital nomad visa.',
    documents: [
      'Valid passport',
      'Proof of remote work or freelance contracts with foreign entities',
      'Health insurance valid in Argentina',
      'Clean criminal record',
      'Proof of accommodation'
    ],
    officialUrl: 'https://www.argentina.gob.ar/interior/migraciones',
    description: 'Argentina\'s digital nomad visa offers Buenos Aires\' world-class culture, incredible steaks, and tango — all at very favorable exchange rates for foreign earners.',
    highlights: ['No income minimum', 'Tax-exempt for 12 months', 'Favorable exchange rates']
  },
  {
    country: 'Ecuador',
    flag: '🇪🇨',
    continent: 'South America',
    minIncome: 1350,
    minIncomeDisplay: '$1,350 / month (3x min wage)',
    duration: '2 years (renewable)',
    durationDisplay: '2 years',
    fee: '$450',
    taxImplications: 'Foreign-sourced income is not subject to Ecuadorian income tax for digital nomad visa holders.',
    documents: [
      'Valid passport',
      'Employment contract or proof of freelance work',
      'Bank statements proving income threshold',
      'Health insurance valid in Ecuador',
      'Clean criminal record (apostilled)'
    ],
    officialUrl: 'https://www.cancilleria.gob.ec',
    description: 'Ecuador offers digital nomads incredible biodiversity, from the Andes to the Amazon to the Galápagos, along with a dollarized economy and very low cost of living.',
    highlights: ['Tax-free foreign income', 'Dollarized economy (USD)', 'Incredible biodiversity']
  },
  {
    country: 'Panama',
    flag: '🇵🇦',
    continent: 'North America',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '9 months (renewable up to 18 months)',
    durationDisplay: '9-18 months',
    fee: '$300',
    taxImplications: 'Panama uses a territorial tax system — foreign-sourced income is completely tax-free.',
    documents: [
      'Valid passport',
      'Proof of remote employment with a company outside Panama',
      'Bank statement showing $3,000+/month income',
      'Professional reference letter',
      'Health insurance valid in Panama'
    ],
    officialUrl: 'https://www.migracion.gob.pa',
    description: 'Panama\'s Remote Worker Visa combines a territorial tax system (zero tax on foreign income) with a strategic location, modern infrastructure, and a dollarized economy.',
    highlights: ['Zero tax on foreign income', 'Dollarized economy', 'Modern infrastructure']
  },
  {
    country: 'Antigua and Barbuda',
    flag: '🇦🇬',
    continent: 'North America',
    minIncome: 4200,
    minIncomeDisplay: '$4,200 / month ($50k/year)',
    duration: '2 years',
    durationDisplay: '2 years',
    fee: '$1,500 (individual) / $2,000 (couple)',
    taxImplications: 'No income tax — Antigua and Barbuda has zero personal income tax.',
    documents: [
      'Valid passport',
      'Proof of employment with a company outside Antigua',
      'Proof of annual income exceeding $50,000',
      'Health insurance',
      'Clean criminal record'
    ],
    officialUrl: 'https://nomaddigitalresidence.ag',
    description: 'Antigua and Barbuda\'s Nomad Digital Residence offers two years on stunning Caribbean beaches with zero income tax and 365 beaches — one for every day of the year.',
    highlights: ['Zero income tax', '365 pristine beaches', '2-year duration']
  },
  {
    country: 'Barbados (Welcome Stamp)',
    flag: '🇧🇧',
    continent: 'North America',
    minIncome: 4200,
    minIncomeDisplay: '$4,200 / month ($50k/year)',
    duration: '1 year',
    durationDisplay: '1 year',
    fee: '$2,000 (individual) / $3,000 (family)',
    taxImplications: 'No Barbadian income tax on remote earnings during the Welcome Stamp period.',
    documents: [
      'Valid passport',
      'Proof of employment or business generating $50,000+/year',
      'Health insurance valid in Barbados',
      'Negative COVID test or vaccination proof (if required)',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.barbadoswelcomestamp.bb',
    description: 'Barbados pioneered the Caribbean remote work movement with the Welcome Stamp, offering a year of island living with no local taxes on remote income.',
    highlights: ['Pioneer Caribbean remote work visa', 'Zero tax on remote income', 'World-class beaches']
  },
  {
    country: 'Bermuda',
    flag: '🇧🇲',
    continent: 'North America',
    minIncome: 0,
    minIncomeDisplay: 'No minimum income (must be employed remotely)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$263',
    taxImplications: 'Bermuda has no income tax, capital gains tax, or withholding tax.',
    documents: [
      'Valid passport',
      'Proof of remote employment or self-employment',
      'Health insurance valid in Bermuda',
      'Clean criminal record',
      'Proof of accommodation'
    ],
    officialUrl: 'https://www.gov.bm/work-from-bermuda',
    description: 'Bermuda\'s Work from Bermuda Certificate offers a tax-free Atlantic island lifestyle with pink sand beaches, just a 2-hour flight from the US East Coast.',
    highlights: ['Zero income tax', 'Close to US East Coast', 'Pink sand beaches']
  },
  {
    country: 'Cayman Islands',
    flag: '🇰🇾',
    continent: 'North America',
    minIncome: 8350,
    minIncomeDisplay: '$8,350 / month ($100k/year)',
    duration: '2 years',
    durationDisplay: '2 years',
    fee: '$1,469',
    taxImplications: 'Cayman Islands has zero income tax, zero capital gains tax, and zero corporate tax.',
    documents: [
      'Valid passport',
      'Proof of employment with a company outside Cayman Islands',
      'Proof of annual income of $100,000+ (or $150,000 for couples)',
      'Health insurance valid in Cayman Islands',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.visitcaymanislands.com/en-us/global-citizen-concierge',
    description: 'The Cayman Islands\' Global Citizen Concierge is the ultimate premium digital nomad visa for high earners, offering a completely tax-free Caribbean paradise.',
    highlights: ['Completely tax-free', 'Premium luxury lifestyle', '2-year duration']
  },
  {
    country: 'Curaçao',
    flag: '🇨🇼',
    continent: 'North America',
    minIncome: 3000,
    minIncomeDisplay: '$3,000 / month',
    duration: '6 months (renewable up to 1 year)',
    durationDisplay: '6-12 months',
    fee: '$294',
    taxImplications: 'Remote income earned from outside Curaçao is not subject to local income tax.',
    documents: [
      'Valid passport',
      'Proof of remote employment',
      'Proof of income showing $3,000/month',
      'Health insurance valid in Curaçao',
      'Proof of accommodation'
    ],
    officialUrl: 'https://athomeincuracao.com',
    description: 'Curaçao\'s @HOME program offers Dutch Caribbean charm, colorful Willemstad, stunning diving, and year-round warm weather for digital nomads.',
    highlights: ['Tax-free remote income', 'Dutch Caribbean culture', 'Year-round diving']
  },
  {
    country: 'Dominica',
    flag: '🇩🇲',
    continent: 'North America',
    minIncome: 4200,
    minIncomeDisplay: '$4,200 / month ($50k/year)',
    duration: '18 months',
    durationDisplay: '18 months',
    fee: '$800 (individual) / $1,200 (family)',
    taxImplications: 'No income tax on foreign-sourced remote earnings in Dominica.',
    documents: [
      'Valid passport',
      'Proof of annual income exceeding $50,000',
      'Proof of remote employment or business',
      'Health insurance',
      'Clean criminal record'
    ],
    officialUrl: 'https://www.dominica.gov.dm',
    description: 'Dominica\'s Work In Nature (WIN) visa offers digital nomads 18 months on the "Nature Island of the Caribbean," with rainforests, hot springs, and diving.',
    highlights: ['18-month duration', 'Nature Island lifestyle', 'Tax-free remote income']
  },
  {
    country: 'Seychelles',
    flag: '🇸🇨',
    continent: 'Africa',
    minIncome: 0,
    minIncomeDisplay: 'No minimum income (proof of remote work required)',
    duration: '1 year (renewable)',
    durationDisplay: '1 year',
    fee: '$50',
    taxImplications: 'Foreign-sourced remote income is not subject to Seychelles income tax.',
    documents: [
      'Valid passport',
      'Proof of remote employment or freelance activity',
      'Proof of accommodation in Seychelles',
      'Health insurance',
      'Return flight booking or proof of travel funds'
    ],
    officialUrl: 'https://www.ics.gov.sc',
    description: 'The Seychelles Workcation Retreat Visa offers digital nomads a dreamy Indian Ocean archipelago with pristine beaches, nature reserves, and virtually no taxes.',
    highlights: ['No minimum income', 'Tax-free foreign income', 'Pristine island paradise']
  },
  {
    country: 'Namibia',
    flag: '🇳🇦',
    continent: 'Africa',
    minIncome: 2000,
    minIncomeDisplay: '$2,000 / month',
    duration: '6 months (renewable up to 1 year)',
    durationDisplay: '6-12 months',
    fee: '$150',
    taxImplications: 'Foreign-sourced income is not taxed in Namibia for digital nomad visa holders.',
    documents: [
      'Valid passport',
      'Proof of remote work or freelance contracts',
      'Bank statements proving income',
      'Health insurance valid in Namibia',
      'Proof of accommodation'
    ],
    officialUrl: 'https://mhaiss.gov.na',
    description: 'Namibia\'s digital nomad visa invites remote workers to experience vast desert landscapes, world-class safari, and Windhoek\'s growing tech scene.',
    highlights: ['Tax-free foreign income', 'World-class safari & deserts', 'Growing tech community']
  }
];

export default function VisasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncomeFilter, setSelectedIncomeFilter] = useState('all');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [activeModalVisa, setActiveModalVisa] = useState<VisaData | null>(null);

  const continents = useMemo(() => {
    const set = new Set(VISAS.map(v => v.continent));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filteredVisas = useMemo(() => {
    let result = VISAS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => v.country.toLowerCase().includes(q) || v.continent.toLowerCase().includes(q));
    }
    if (selectedIncomeFilter !== 'all') {
      const maxIncome = parseInt(selectedIncomeFilter);
      result = result.filter(v => v.minIncome <= maxIncome);
    }
    if (selectedContinent !== 'all') {
      result = result.filter(v => v.continent === selectedContinent);
    }
    return result;
  }, [searchQuery, selectedIncomeFilter, selectedContinent]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black selection:bg-primary/10 transition-colors duration-200 flex flex-col">
      <Header />
      <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex-1">
        {/* Back Link */}
        <Link
          href="/nomad"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Page Header */}
        <div className="flex flex-col mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 transition-colors">
            Digital Nomad Visas
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 transition-colors max-w-3xl">
            Explore and compare {VISAS.length} active digital nomad visas across the world. Filter by region, income requirements, and tax rules.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Continent Filter */}
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[160px]"
          >
            {continents.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Regions' : c}</option>
            ))}
          </select>

          {/* Income Filter */}
          <select
            value={selectedIncomeFilter}
            onChange={(e) => setSelectedIncomeFilter(e.target.value)}
            className="h-10 px-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[200px]"
          >
            <option value="all">Any Income Requirement</option>
            <option value="0">No Monthly Minimum (Savings Only)</option>
            <option value="2500">Under $2,500/mo</option>
            <option value="3500">Under $3,500/mo</option>
            <option value="4500">Under $4,500/mo</option>
            <option value="6000">Under $6,000/mo</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Showing {filteredVisas.length} of {VISAS.length} visas
        </p>

        {/* Visas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisas.map((visa) => (
            <div
              key={visa.country}
              onClick={() => setActiveModalVisa(visa)}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm dark:hover:shadow-white/5 transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{visa.flag}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                    {visa.country}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{visa.continent}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-1.5">
                {visa.highlights.map((h, idx) => (
                  <span key={idx} className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[11px] px-2 py-0.5 rounded-md font-medium">
                    {h}
                  </span>
                ))}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-50">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Coins className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs font-semibold truncate">
                    {visa.minIncome === 0 ? 'No min' : `$${visa.minIncome.toLocaleString()}/mo`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <p className="text-xs font-semibold truncate">{visa.durationDisplay}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredVisas.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Search className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">No visas match your filters</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Try resetting search or filters.</p>
          </div>
        )}
      </main>

      <MicroFooter />
      <TelegramJobPopup />

      {/* Modal Detail Overlay */}
      {activeModalVisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeModalVisa.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {activeModalVisa.country} Nomad Visa
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{activeModalVisa.continent}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalVisa(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {activeModalVisa.description}
              </p>

              {/* Requirement Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Min Income</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {activeModalVisa.minIncomeDisplay}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                    {activeModalVisa.duration}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Visa Fee</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {activeModalVisa.fee}
                  </p>
                </div>
              </div>

              {/* Tax Implications */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2">
                  <Landmark className="w-3.5 h-3.5" />
                  Tax Implications
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  {activeModalVisa.taxImplications}
                </p>
              </div>

              {/* Documents Required */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  Documents Needed
                </h4>
                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {activeModalVisa.documents.map((doc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setActiveModalVisa(null)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all w-full sm:w-auto"
              >
                Close
              </button>
              <a
                href={activeModalVisa.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto"
              >
                Apply via Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
