import {
  Circle,
  Timer,
  CheckCircle,
  CircleOff,
  HelpCircle,
} from 'lucide-react'

export const labels = [
  {
    value: 'organik',
    label: 'Organik',
  },
  {
    value: 'anorganik',
    label: 'Anorganik',
  },
  {
    value: 'plastik',
    label: 'Plastik',
  },
  {
    value: 'rumah-tangga',
    label: 'Rumah Tangga',
  },
]

export const statuses = [
  {
    label: 'Menunggu',
    value: 'menunggu' as const,
    icon: HelpCircle,
  },
  {
    label: 'Diproses',
    value: 'diproses' as const,
    icon: Timer,
  },
  {
    label: 'Selesai',
    value: 'selesai' as const,
    icon: CheckCircle,
  },
  {
    label: 'Dibatalkan',
    value: 'dibatalkan' as const,
    icon: CircleOff,
  },
]

export const priorities = [
  {
    label: 'Rendah',
    value: 'low' as const,
    icon: Circle,
  },
  {
    label: 'Sedang',
    value: 'medium' as const,
    icon: Circle,
  },
  {
    label: 'Tinggi',
    value: 'high' as const,
    icon: Timer,
  },
]

export const tasks = [
  {
    id: 'SW-001',
    title: 'Sampah menumpuk di pinggir jalan',
    category: 'rumah-tangga',
    location: 'Jl. Ahmad Yani',
    description: 'Terdapat tumpukan sampah di pinggir jalan.',
    photo: '',
    status: 'menunggu',
    priority: 'high',
  },
  {
    id: 'SW-002',
    title: 'Sampah plastik berserakan',
    category: 'plastik',
    location: 'Area Kampus',
    description: 'Sampah plastik terlihat berserakan di sekitar area kampus.',
    photo: '',
    status: 'diproses',
    priority: 'medium',
  },
  {
    id: 'SW-003',
    title: 'Sampah rumah tangga menumpuk',
    category: 'rumah-tangga',
    location: 'Jl. Sao-Sao',
    description: 'Tumpukan sampah rumah tangga belum dibersihkan.',
    photo: '',
    status: 'selesai',
    priority: 'high',
  },
  {
    id: 'SW-004',
    title: 'Sampah di sekitar pasar',
    category: 'organik',
    location: 'Pasar Baruga',
    description: 'Ditemukan sampah yang menumpuk di sekitar pasar.',
    photo: '',
    status: 'menunggu',
    priority: 'high',
  },
  {
    id: 'SW-005',
    title: 'Sampah botol plastik',
    category: 'plastik',
    location: 'Jl. Abunawas',
    description: 'Banyak botol plastik ditemukan di sekitar lokasi.',
    photo: '',
    status: 'diproses',
    priority: 'low',
  },
]
