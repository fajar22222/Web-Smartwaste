import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  Timer,
  HelpCircle,
  CircleOff,
} from 'lucide-react'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
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
    value: 'rendah' as const,
    icon: ArrowDown,
  },
  {
    label: 'Sedang',
    value: 'sedang' as const,
    icon: ArrowRight,
  },
  {
    label: 'Tinggi',
    value: 'tinggi' as const,
    icon: ArrowUp,
  },
  {
    label: 'Critical',
    value: 'critical' as const,
    icon: AlertCircle,
  },
]
