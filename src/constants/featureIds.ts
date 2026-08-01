export interface SupremeFeature {
  id: string;
  name: string;
  category: string;
}

export const SUPREME_FEATURES: SupremeFeature[] = [
  { id: 'FT-MKT-101', name: 'Marketplace', category: 'Commerce' },
  { id: 'FT-CHT-202', name: 'Chat', category: 'Community' },
  { id: 'FT-NET-303', name: 'Network', category: 'Community' },
  { id: 'FT-AIT-404', name: 'AI Tools', category: 'Tools' },
  { id: 'FT-GMT-505', name: 'Supreme GMT', category: 'Main' },
  { id: 'FT-SCR-606', name: 'Streams', category: 'Media' },
  { id: 'FT-HLF-707', name: 'Hall of Fame', category: 'Community' },
  { id: 'FT-UTL-808', name: 'Business Tools', category: 'Tools' },
  { id: 'FT-COI-909', name: 'Supreme Coin Optimum', category: 'Finance' },
  { id: 'FT-HRD-010', name: 'Hardware Mining', category: 'Finance' },
  { id: 'FT-MED-111', name: 'Media', category: 'Media' },
  { id: 'FT-NOB-888', name: 'Supreme Nobles', category: 'Main' },
  { id: 'FT-BOX-777', name: 'Supreme Mysterious Box', category: 'Main' },
  { id: 'FT-TRS-555', name: 'Noble Treasure', category: 'Main' },
  { id: 'FT-SHR-700', name: 'Super Shorts', category: 'Media' },
  { id: 'FT-SSP-800', name: 'Super Sounds Promote', category: 'Media' },
  { id: 'FT-ADM-999', name: 'Admin Dashboard', category: 'Main' }
];

export const getFeatureById = (id: string) => SUPREME_FEATURES.find(f => f.id === id);
export const getFeatureByName = (name: string) => SUPREME_FEATURES.find(f => f.name === name);
