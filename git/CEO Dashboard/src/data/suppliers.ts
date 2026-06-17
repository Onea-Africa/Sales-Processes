export type SupplierCategory =
  | 'IT Hardware & Software'
  | 'Gadgets & Consumer Electronics'
  | 'Apple Devices & Ecosystem'
  | 'Networking'
  | 'All-Rounder';

export type SupplierProductPath = {
  name: string;
  builderId: string;
  products: string[];
};

export type SupplierPartnerId = {
  label: string;
  value: string;
};

export type Supplier = {
  id: string;
  name: string;
  accountNumber: string;
  url: string;
  category: SupplierCategory;
  tags: string[];
  brands: string[];
  bestFor: string;
  partnerIds?: SupplierPartnerId[];
  notes?: string;
  productPaths: SupplierProductPath[];
};

export const supplierCategories: Array<'All' | SupplierCategory> = [
  'All',
  'IT Hardware & Software',
  'Gadgets & Consumer Electronics',
  'Apple Devices & Ecosystem',
  'Networking',
  'All-Rounder',
];

export const suppliers: Supplier[] = [
  {
    id: 'mustek',
    name: 'Mustek',
    accountNumber: '859716',
    url: 'https://mustek.co.za',
    category: 'IT Hardware & Software',
    tags: ['printers', 'notebooks', 'apple', 'energy', 'pos'],
    brands: ['Mecer', 'Acer', 'Asus', 'Apple', 'Lenovo', 'Samsung', 'Epson', 'Ricoh', 'Brother', 'MSI', 'Logitech', 'Huawei Consumer', 'Azure', 'Acronis', 'Eaton', 'NComputing'],
    bestFor: 'Printers, Mecer budget devices, Lenovo and Acer notebooks, Apple Business, energy/UPS, and POS hardware.',
    productPaths: [
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['notebooks', 'printers', 'desktops'] },
      { name: 'Energy & UPS', builderId: 'energy-ups', products: ['UPS', 'power protection', 'energy hardware'] },
      { name: 'POS Hardware', builderId: 'pos-hardware', products: ['POS terminals', 'scanners', 'receipt printers'] },
    ],
  },
  {
    id: 'tarsus',
    name: 'Tarsus Distribution',
    accountNumber: 'TA10046313',
    url: 'https://www.tarsus.co.za',
    category: 'IT Hardware & Software',
    tags: ['surface', 'microsoft', 'enterprise', 'networking', 'servers', 'security'],
    brands: ['Microsoft Surface', 'Windows OS', 'Windows Server', 'Microsoft Office', 'Dell', 'HPE', 'Cisco', 'Juniper', 'APC', 'Sophos', 'TeamViewer', 'Check Point', 'Commvault', 'Samsung', 'Logitech', 'Canon', 'Darktrace'],
    bestFor: 'Surface devices, Windows and Office licensing, enterprise networking, servers, and cybersecurity.',
    notes: 'Exclusive Microsoft Surface distributor in SA.',
    productPaths: [
      { name: 'Cloud Licensing / Microsoft 365', builderId: 'cloud-licensing', products: ['Microsoft 365', 'Windows', 'Office', 'Server'] },
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['Surface', 'Dell', 'HPE', 'enterprise hardware'] },
      { name: 'Energy & UPS', builderId: 'energy-ups', products: ['APC UPS', 'power protection'] },
    ],
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle ICT',
    accountNumber: 'ONE025',
    url: 'https://www.pinnacle.co.za',
    category: 'IT Hardware & Software',
    tags: ['microsoft', 'esd', 'cabling', 'tenders', 'budget'],
    brands: ['Microsoft ESD', 'Lenovo', 'HP', 'Dell', 'Asus', 'Huawei', 'Intel', 'Kingston', 'CommScope', 'Proline', 'Pinnsec'],
    bestFor: 'Windows and Office ESD keys, Proline budget hardware, structured cabling, and tender procurement support.',
    notes: 'Also handles warranty and break-fix repairs.',
    productPaths: [
      { name: 'Cloud Licensing / Microsoft 365', builderId: 'cloud-licensing', products: ['Microsoft ESD', 'Windows', 'Office'] },
      { name: 'Network Cabinets & Structured Cabling', builderId: 'structured-cabling', products: ['CommScope', 'Datanet', 'cabling supplies'] },
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['Proline', 'Lenovo', 'HP', 'Dell'] },
    ],
  },
  {
    id: 'axiz',
    name: 'Axiz Digital',
    accountNumber: 'SJOA9905',
    url: 'https://www.axiz.com',
    category: 'IT Hardware & Software',
    tags: ['microsoft365', 'csp', 'azure', 'cisco', 'cloud', 'enterprise'],
    brands: ['Microsoft 365 CSP', 'Microsoft Azure', 'Dynamics 365', 'Cisco', 'Dell', 'HPE', 'Adobe', 'IBM', 'Veeam', 'VMware', 'Red Hat', 'Citrix', 'Fortinet', 'Trend Micro', 'Supermicro'],
    bestFor: 'M365 CSP monthly resale, Azure resale, Cisco partner path, and enterprise cloud procurement.',
    partnerIds: [{ label: 'Fortinet POS ID', value: 'FT-1618899' }],
    notes: 'Primary M365 CSP channel. AxizCloud supports white-label reseller workflows.',
    productPaths: [
      { name: 'Cloud Licensing / Microsoft 365', builderId: 'cloud-licensing', products: ['M365 CSP', 'Azure', 'Dynamics 365'] },
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['Cisco', 'Dell', 'HPE', 'enterprise servers'] },
      { name: 'Cybersecurity / Firewall', builderId: 'cybersecurity-firewall', products: ['Fortinet', 'firewalls', 'endpoint security'] },
    ],
  },
  {
    id: 'syntech',
    name: 'Syntech',
    accountNumber: 'ONEA025',
    url: 'https://www.syntech.co.za',
    category: 'Gadgets & Consumer Electronics',
    tags: ['gadgets', 'accessories', 'components', 'smart-home', 'wearables'],
    brands: ['Acer', 'Asus', 'LG', 'UGREEN', 'Hikvision', 'Hiksemi', 'Wanbo', 'RAVPower', 'TaoTronics', 'Canyon', 'PCBuilder', 'Port Designs'],
    bestFor: 'Tech accessories, USB hubs, cables, power banks, smart home gadgets, RAM, SSDs, and surveillance cameras.',
    notes: 'Triple Channelwise Award winner 2025.',
    productPaths: [
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['accessories', 'RAM', 'SSDs', 'USB hubs'] },
      { name: 'Smart CCTV & Access Control', builderId: 'cctv-access', products: ['Hikvision', 'Hiksemi', 'surveillance'] },
    ],
  },
  {
    id: 'asbis',
    name: 'ASBIS Africa',
    accountNumber: '201478',
    url: 'https://www.asbisafrica.co.za',
    category: 'Apple Devices & Ecosystem',
    tags: ['apple', 'iphone', 'mac', 'ipad', 'storage', 'gaming'],
    brands: ['Apple', 'Intel', 'AMD', 'Seagate', 'Western Digital', 'Samsung', 'Dell', 'Acer', 'Lenovo', 'Canyon', 'AENO'],
    bestFor: 'Competitive Apple pricing, iPhone, Mac, iPad, trade-in programme, and storage.',
    notes: 'Compare pricing vs Core Group per Apple order.',
    productPaths: [
      { name: 'Apple Device Procurement', builderId: 'apple-devices', products: ['iPhone', 'Mac', 'iPad', 'Apple accessories'] },
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['storage', 'Dell', 'Lenovo', 'Acer'] },
    ],
  },
  {
    id: 'core',
    name: 'Core Group',
    accountNumber: 'ONEA AFRICA',
    url: 'https://core.co.za',
    category: 'Apple Devices & Ecosystem',
    tags: ['apple', 'dji', 'nintendo', 'surface', 'warranty'],
    brands: ['Apple', 'DJI', 'Nintendo', 'Microsoft Surface', 'Apple accessories', 'iCare'],
    bestFor: 'Apple Reseller Programme access, DJI drones, Nintendo, and iCare extended warranty.',
    notes: 'Use Core for DJI and Nintendo. Compare Apple pricing vs ASBIS per order.',
    productPaths: [
      { name: 'Apple Device Procurement', builderId: 'apple-devices', products: ['Mac', 'iPad', 'iPhone', 'iCare'] },
      { name: 'Digital Marketing', builderId: 'marketing', products: ['DJI drones for content production'] },
    ],
  },
  {
    id: 'miro',
    name: 'MiRO Distribution',
    accountNumber: 'CWEA006',
    url: 'https://miro.co.za',
    category: 'Networking',
    tags: ['wifi', 'ubiquiti', 'mikrotik', 'cctv', 'fibre', 'access-control'],
    brands: ['Ubiquiti', 'MikroTik', 'Cambium Networks', 'Edimax', 'Cudy', 'Grandstream', 'Tenda', 'Mercusys', 'Yealink', 'Hikvision', 'fibre optics'],
    bestFor: 'Ubiquiti UniFi WiFi, MikroTik routers, CCTV, access control, fibre patch cables, cabinets, and IoT devices.',
    productPaths: [
      { name: 'Enterprise / Business WiFi', builderId: 'wifi-business', products: ['Ubiquiti', 'MikroTik', 'Cambium', 'Cudy'] },
      { name: 'Residential / Home WiFi', builderId: 'wifi-home', products: ['Cudy', 'Tenda', 'Mercusys', 'MikroTik'] },
      { name: 'Smart CCTV & Access Control', builderId: 'cctv-access', products: ['Hikvision', 'access control', 'IoT'] },
      { name: 'VoIP & Unified Communications', builderId: 'voip-uc', products: ['Grandstream', 'Yealink'] },
      { name: 'Network Cabinets & Structured Cabling', builderId: 'structured-cabling', products: ['fibre optics', 'patch cables', 'cabinets'] },
    ],
  },
  {
    id: 'scoop',
    name: 'Scoop Distribution',
    accountNumber: 'WEA001',
    url: 'https://scoop.co.za',
    category: 'Networking',
    tags: ['wifi', 'ubiquiti', 'mikrotik', 'voip', 'cabling', 'cabinets'],
    brands: ['Ubiquiti', 'MikroTik', 'Fanvil', 'Reyee', 'Cudy', 'Linkbasic', 'Rackstuds', 'Biwin', 'Scoop cabinets', 'Scoop PoE switches'],
    bestFor: 'Ubiquiti and MikroTik at competitive prices, real-time branch stock, cabinets, cabling, and budget Fanvil VoIP.',
    notes: 'Check Midrand stock for fastest Gauteng delivery.',
    productPaths: [
      { name: 'Enterprise / Business WiFi', builderId: 'wifi-business', products: ['Ubiquiti', 'Reyee', 'Cudy', 'MikroTik'] },
      { name: 'Residential / Home WiFi', builderId: 'wifi-home', products: ['Cudy', 'Ubiquiti', 'Reyee'] },
      { name: 'Network Cabinets & Structured Cabling', builderId: 'structured-cabling', products: ['Linkbasic', 'Scoop cabinets', 'UTP cable'] },
      { name: 'VoIP & Unified Communications', builderId: 'voip-uc', products: ['Fanvil', 'MikroTik'] },
    ],
  },
  {
    id: 'nology',
    name: 'Nology',
    accountNumber: 'ONE025',
    url: 'https://www.nology.co.za',
    category: 'All-Rounder',
    tags: ['voip', 'yealink', 'zyxel', 'mikrotik', '3cx', 'video-conferencing'],
    brands: ['Yealink', 'Zyxel', 'MikroTik', '3CX', 'Logitech', 'Pexip', 'Neat', 'Gigaset', 'DNAKE', 'Inogeni', 'Cambium Networks'],
    bestFor: 'Yealink IP phones, 3CX phone systems, Zyxel routers and fibre CPE, Logitech meeting rooms, and UC projects.',
    notes: 'Part of Epsidon Group. Account code ONE025, confirm with Nology team if needed.',
    productPaths: [
      { name: 'VoIP & Unified Communications', builderId: 'voip-uc', products: ['Yealink', '3CX', 'Logitech meeting rooms'] },
      { name: 'Enterprise / Business WiFi', builderId: 'wifi-business', products: ['Zyxel', 'Cambium', 'MikroTik'] },
      { name: 'IT Hardware Procurement', builderId: 'it-hardware', products: ['UC devices', 'meeting room hardware'] },
    ],
  },
];
