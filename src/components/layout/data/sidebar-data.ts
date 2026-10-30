import {
  LayoutDashboard,
  ClipboardList,
  Tags,
  Users,
  Recycle,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Pengguna SmartWaste',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },

  teams: [
    {
      name: 'SmartWaste',
      logo: Recycle,
      plan: 'SDG 11',
    },
  ],

  navGroups: [
    {
      title: 'Menu Utama',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Laporan Sampah',
          url: '/tasks',
          icon: ClipboardList,
        },
        {
          title: 'Kategori Sampah',
          url: '/apps',
          icon: Tags,
        },
        {
          title: 'Pengguna',
          url: '/users/',
          icon: Users,
        },
      ],
    },
  ],
}
