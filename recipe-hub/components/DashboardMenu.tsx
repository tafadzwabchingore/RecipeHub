'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, UserCircle } from 'lucide-react'

interface DashboardMenuProps {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export default function DashboardMenu({ variant = 'desktop', onNavigate }: DashboardMenuProps) {
  const [open, setOpen] = useState(false)
  const isMobile = variant === 'mobile'

  return (
    <div className={isMobile ? 'flex flex-col gap-2' : 'border rounded-lg'}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={isMobile ? 'flex items-center gap-2' : 'flex items-center gap-2 w-full hover:bg-gray-300 rounded-lg p-2'}
      >
        <UserCircle size={20} />
        <span>Dashboard</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className={isMobile ? 'ml-8 flex flex-col gap-1 text-lg text-gray-700' : 'mt-2 ml-7 flex flex-col gap-1 text-sm text-gray-700'}>
          <Link href="/dashboard" onClick={onNavigate} className="hover:text-orange-600">
            My Recipes
          </Link>
          <Link href="/dashboard/favorites" onClick={onNavigate} className="hover:text-orange-600 sm:mb-2">
            Favorites
          </Link>
        </div>
      )}
    </div>
  )
}
