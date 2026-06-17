export type AppleProcurementItem = {
  category: string;
  name: string;
  description: string;
  specs: string[];
  icon: string;
  asbisSku?: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: string;
  optionGroups: Array<{
    label: string;
    options: string[];
  }>;
};

const macFinishOptions = ['Space Black / Dark finish', 'Silver', 'Starlight / Light finish', 'Confirm available colours'];
const setupOptions = ['Device only', 'Device + email setup', 'Device + Microsoft 365 setup', 'Device + data transfer and handover'];
const quantityOptions = ['1 unit', '2 units', '3-5 units', '6-10 units', '10+ units'];

export const appleDeviceProducts: AppleProcurementItem[] = [
  {
    category: 'Mac',
    name: 'MacBook Pro M5 (New)',
    description: 'New-generation performance notebook for creative teams, developers, leadership and high-workload users.',
    specs: ['New M5 model path', 'Pro performance options', 'Setup and handover available'],
    icon: 'laptop_mac',
    asbisSku: 'MJLV4ZE/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/260309150029172959.jpg',
    imageAlt: '14-inch MacBook Pro with Apple M5 Pro chip',
    optionGroups: [
      { label: 'Processor / chip', options: ['M5', 'M5 Pro', 'M5 Max', 'Confirm best available chip'] },
      { label: 'Memory', options: ['16GB', '24GB', '32GB', '64GB', 'Confirm workload requirement'] },
      { label: 'Storage', options: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD'] },
      { label: 'Finish', options: macFinishOptions },
      { label: 'Setup', options: setupOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Mac',
    name: 'MacBook Neo',
    description: '13-inch MacBook Neo procurement path with Apple A18 Pro, Liquid Retina display, Wi-Fi 6E and colour-specific availability checks.',
    specs: ['13-inch Liquid Retina display', 'Apple A18 Pro chip', '8GB unified memory', 'Power adapter sold separately'],
    icon: 'laptop_mac',
    asbisSku: 'MHFA4ZE/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/260331160046487436.jpg',
    imageAlt: '13-inch MacBook Neo in Silver',
    badge: 'Best seller',
    optionGroups: [
      { label: 'Processor / chip', options: ['Apple A18 Pro chip'] },
      { label: 'Memory', options: ['8GB unified memory'] },
      { label: 'Storage', options: ['256GB SSD', '512GB SSD'] },
      { label: 'Finish', options: ['Silver', 'Blush', 'Citrus', 'Indigo', 'Confirm available finish'] },
      { label: 'Keyboard', options: ['Magic Keyboard', 'Magic Keyboard with Touch ID'] },
      { label: 'Power adapter', options: ['Add compatible USB-C power adapter', 'No power adapter required', 'Confirm required wattage'] },
      { label: 'Setup', options: setupOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Mac',
    name: 'MacBook Pro',
    description: 'Performance notebook for creative teams, developers, leadership and high-workload users.',
    specs: ['Pro performance options', 'Retina display', 'Setup and handover available'],
    icon: 'laptop_mac',
    asbisSku: 'Z1FT000PM',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250704160039268515.jpg',
    imageAlt: '16-inch MacBook Pro in Space Black',
    optionGroups: [
      { label: 'Processor / chip', options: ['Pro chip', 'Max chip', 'Confirm current generation'] },
      { label: 'Screen size', options: ['14-inch', '16-inch', 'Confirm available size'] },
      { label: 'Memory', options: ['16GB', '24GB', '32GB', '64GB'] },
      { label: 'Storage', options: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD'] },
      { label: 'Finish', options: macFinishOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Mac',
    name: 'MacBook Air',
    description: 'Lightweight Apple notebook for executives, mobile staff, students and everyday business users.',
    specs: ['M-series performance', 'All-day battery life', 'Optional Microsoft 365 and email setup'],
    icon: 'laptop_mac',
    asbisSku: 'MC7A4ZE/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250515142915881644.jpg',
    imageAlt: '15-inch MacBook Air in Sky Blue',
    optionGroups: [
      { label: 'Screen size', options: ['13-inch', '15-inch', 'Confirm available size'] },
      { label: 'Memory', options: ['8GB', '16GB', '24GB'] },
      { label: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
      { label: 'Finish', options: macFinishOptions },
      { label: 'Setup', options: setupOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Desktop',
    name: 'Mac mini',
    description: 'Compact Apple desktop option for offices, reception areas, studios and managed workstations.',
    specs: ['Compact desktop option', 'Keyboard/mouse accessories optional', 'Business handover support'],
    icon: 'desktop_mac',
    asbisSku: 'MU9D3SO/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/241104110020956889.jpg',
    imageAlt: 'Apple Mac mini desktop computer',
    optionGroups: [
      { label: 'Processor / chip', options: ['Standard chip', 'Pro chip', 'Confirm current generation'] },
      { label: 'Memory', options: ['16GB', '24GB', '32GB', '64GB'] },
      { label: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
      { label: 'Accessories', options: ['No accessories', 'Add keyboard and mouse', 'Add display', 'Add full workstation bundle'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Desktop',
    name: 'Mac Studio',
    description: 'High-performance Apple desktop procurement for creative, production and technical workloads.',
    specs: ['Performance desktop option', 'Display and accessory matching', 'Configuration confirmed before quote'],
    icon: 'desktop_mac',
    asbisSku: 'MU963SO/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250626092432032700.jpg',
    imageAlt: 'Apple Mac Studio desktop computer',
    optionGroups: [
      { label: 'Processor / chip', options: ['Max chip', 'Ultra chip', 'Confirm workload requirement'] },
      { label: 'Memory', options: ['32GB', '64GB', '128GB', 'Confirm recommended memory'] },
      { label: 'Storage', options: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD', '8TB SSD'] },
      { label: 'Accessories', options: ['No accessories', 'Add display', 'Add keyboard/mouse', 'Add full workstation bundle'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Desktop',
    name: 'iMac',
    description: 'All-in-one Apple desktop option for front office, studio, executive and education environments.',
    specs: ['All-in-one desktop option', 'Colour/configuration options checked', 'Setup and handover available'],
    icon: 'desktop_mac',
    asbisSku: 'MWUU3SO/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/241104110054033562.jpg',
    imageAlt: '24-inch Apple iMac in Silver',
    optionGroups: [
      { label: 'Memory', options: ['8GB', '16GB', '24GB', 'Confirm recommended memory'] },
      { label: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
      { label: 'Finish', options: ['Blue', 'Green', 'Pink', 'Silver', 'Yellow', 'Orange', 'Purple', 'Confirm available colours'] },
      { label: 'Accessories', options: ['Included accessories only', 'Add Magic Trackpad', 'Add numeric keyboard', 'Add office setup'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'iPad',
    name: 'iPad',
    description: 'Tablet procurement for field teams, education, client-facing workflows and mobile productivity.',
    specs: ['WiFi / cellular options', 'Apple Pencil and keyboard options', 'Device setup available'],
    icon: 'tablet_mac',
    asbisSku: 'MXPR3QA/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250526160043326713.jpg',
    imageAlt: 'Apple iPad mini in Purple',
    optionGroups: [
      { label: 'Model family', options: ['iPad', 'iPad Air', 'iPad Pro', 'iPad mini', 'Confirm recommended model'] },
      { label: 'Connectivity', options: ['WiFi only', 'WiFi + Cellular'] },
      { label: 'Storage', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
      { label: 'Accessories', options: ['No accessory', 'Add Apple Pencil', 'Add keyboard cover', 'Add protective case'] },
      { label: 'Setup', options: setupOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'iPhone',
    name: 'iPhone',
    description: 'Business mobile-device procurement for teams that need reliable iOS devices and support.',
    specs: ['Model and storage options', 'SIM/eSIM readiness', 'Email and app setup available'],
    icon: 'phone_iphone',
    asbisSku: 'MG6K4AF/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250915140037753508.jpg',
    imageAlt: 'Apple iPhone 17 in White',
    optionGroups: [
      { label: 'Model family', options: ['Standard iPhone', 'Plus model', 'Pro model', 'Pro Max model', 'Confirm recommended model'] },
      { label: 'Storage', options: ['128GB', '256GB', '512GB', '1TB'] },
      { label: 'SIM requirement', options: ['Physical SIM', 'eSIM', 'Dual SIM / travel setup', 'Confirm network requirement'] },
      { label: 'Accessories', options: ['No accessory', 'Add case', 'Add charger', 'Add AirPods', 'Add full mobile kit'] },
      { label: 'Setup', options: setupOptions },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
];

export const appleAccessoryProducts: AppleProcurementItem[] = [
  {
    category: 'Accessory',
    name: 'Apple Pencil',
    description: 'Apple Pencil procurement for iPad users in education, creative, sales and field workflows.',
    specs: ['Model compatibility checked', 'Bulk procurement support', 'Setup guidance available'],
    icon: 'stylus',
    asbisSku: 'MX2D3ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250612160031386776.jpg',
    imageAlt: 'Apple Pencil Pro',
    optionGroups: [
      { label: 'Compatibility', options: ['For standard iPad', 'For iPad Air', 'For iPad Pro', 'Confirm exact iPad model'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'Magic Keyboard',
    description: 'Keyboard options for Mac and iPad productivity setups.',
    specs: ['Device compatibility checked', 'Language/layout confirmed', 'Bundle quote available'],
    icon: 'keyboard',
    asbisSku: 'MXK73Z/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250421160021131865.jpg',
    imageAlt: 'Apple Magic Keyboard with Touch ID and Numeric Keypad',
    optionGroups: [
      { label: 'Device use', options: ['For Mac', 'For iPad', 'For desktop workstation', 'Confirm device compatibility'] },
      { label: 'Layout', options: ['Standard layout', 'Numeric keypad', 'International layout check'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'Magic Mouse',
    description: 'Mouse procurement for Mac desktop, MacBook docking and office workstation setups.',
    specs: ['Accessory matching', 'Bulk procurement support', 'Warranty/admin guidance'],
    icon: 'mouse',
    asbisSku: 'MXK53Z/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/251124130625790403.jpg',
    imageAlt: 'Apple Magic Mouse in White',
    optionGroups: [
      { label: 'Finish', options: ['White / Silver', 'Black / Dark finish', 'Confirm available finish'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'Trackpad',
    description: 'Trackpad procurement for Mac workstation users who prefer gesture-based control.',
    specs: ['Compatibility confirmed', 'Desk setup support', 'Quote with Mac bundle available'],
    icon: 'touch_app',
    asbisSku: 'MXK93ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250410160010836966.jpg',
    imageAlt: 'Apple Magic Trackpad in White',
    optionGroups: [
      { label: 'Finish', options: ['White / Silver', 'Black / Dark finish', 'Confirm available finish'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'USB-C Power Adapter',
    description: 'Replacement and additional Apple USB-C chargers for offices, field teams and travel kits.',
    specs: ['Wattage confirmed per device', 'Cable option available', 'Bulk procurement support'],
    icon: 'power',
    asbisSku: 'MW2G3ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250409160020060266.jpg',
    imageAlt: 'Apple 30W USB-C Power Adapter',
    optionGroups: [
      { label: 'Wattage', options: ['20W', '30W', '35W dual USB-C', '67W', '96W / high power', 'Confirm device wattage'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'USB-C Charging Cable',
    description: 'Charging cable procurement for Apple notebooks, tablets and mobile devices.',
    specs: ['Length and connector confirmed', 'Accessory matching', 'Bulk procurement support'],
    icon: 'cable',
    asbisSku: 'MW493ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250409160021384457.jpg',
    imageAlt: 'Apple 60W USB-C charging cable',
    optionGroups: [
      { label: 'Cable type', options: ['USB-C to USB-C', 'USB-C to Lightning', 'MagSafe cable', 'Confirm device cable'] },
      { label: 'Length', options: ['1m', '2m', 'Confirm available length'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'USB-C / Multiport Adapter',
    description: 'Adapter procurement for HDMI, USB-A, Ethernet, card reader and meeting-room connectivity needs.',
    specs: ['Port requirements checked', 'Meeting-room compatibility', 'Bundle quote available'],
    icon: 'hub',
    asbisSku: 'MW5M3ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250408160015688915.jpg',
    imageAlt: 'Apple USB-C Digital AV Multiport Adapter',
    optionGroups: [
      { label: 'Ports required', options: ['HDMI', 'USB-A', 'Ethernet', 'SD card reader', 'Multiport hub', 'Confirm meeting-room need'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'AirPods',
    description: 'Audio accessory procurement for calls, meetings, travel and executive productivity.',
    specs: ['Model options checked', 'Business handover support', 'Warranty/admin guidance'],
    icon: 'headphones',
    asbisSku: 'MXP63ZE/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250612160025936664.jpg',
    imageAlt: 'Apple AirPods 4',
    optionGroups: [
      { label: 'Model family', options: ['AirPods', 'AirPods Pro', 'AirPods Max', 'Confirm preferred model'] },
      { label: 'Use case', options: ['Calls and meetings', 'Travel', 'Executive kit', 'Team bulk order'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
  {
    category: 'Accessory',
    name: 'Cases and Protective Covers',
    description: 'Protective accessories for iPad, iPhone and MacBook deployments.',
    specs: ['Device compatibility checked', 'Colour/style options', 'Bulk procurement support'],
    icon: 'inventory_2',
    asbisSku: 'MGF24ZM/A',
    imageUrl: 'https://content.it4profit.com/pimg/s/resize/900x900x900x900/250910160030572226.jpg',
    imageAlt: 'Apple clear case with MagSafe for iPhone 17',
    optionGroups: [
      { label: 'Device type', options: ['iPhone case', 'iPad cover', 'MacBook sleeve', 'Screen protector', 'Confirm device model'] },
      { label: 'Style', options: ['Basic protection', 'Rugged / field use', 'Executive / premium', 'Clear case'] },
      { label: 'Quantity', options: quantityOptions },
    ],
  },
];

export const allAppleProcurementItems = [
  ...appleDeviceProducts,
  ...appleAccessoryProducts,
];
