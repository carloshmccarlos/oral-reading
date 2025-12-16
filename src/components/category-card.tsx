// Category card component for displaying categories in the home page context grid
// Mirrors the "Pick a Context" card style from memory-bank/UI/home.html

import Link from 'next/link'
import { cn } from '@/lib/utils'

const categoryMeta: Record<string, string> = {
  Home: 'Kitchen, Bedroom, Bath...',
  'Buildings & Facilities': 'Lobby, Elevator, Gym...',
  'Stores & Markets': 'Grocery, Clothing, Tech...',
  'Food & Dining': 'Restaurant, Cafe, Street Food...',
  'Public Places': 'Park, Library, Museum...',
  'School & Academic': 'Classroom, Dorm, Library...',
  'Work & Offices': 'Desk, Break Room, Meetings...',
  Transportation: 'Subway, Bus, Taxi...',
  'Outdoors & Nature': 'Beach, Forest, Trail...',
  Services: 'Bank, Post Office, Clinic...',
}

interface CategoryCardProps {
  name: string
  slug: string
  icon: string
  index: number
  className?: string
}

export function CategoryCard({ name, slug, icon, index, className }: CategoryCardProps) {
  const formattedIndex = String(index).padStart(2, '0')
  const meta = categoryMeta[name] || 'Explore scenarios in this context.'

  return (
    <Link
      href={`/scenarios?category=${slug}`}
      className={cn(
        'group relative flex h-[250px] cursor-pointer flex-col justify-between rounded-sm border border-transparent bg-white p-8 transition-all',
        'hover:border-text-main hover:bg-accent',
        className
      )}
    >
      <span className="absolute right-6 top-4 font-serif text-5xl text-black/5 transition-colors group-hover:text-black/10">
        {formattedIndex}
      </span>

      <div>
        <div className="mb-4 text-2xl">{icon}</div>
        <div className="text-lg font-medium">{name}</div>
        <div className="mt-2 text-sm text-text-muted transition-colors group-hover:text-text-main">
          {meta}
        </div>
      </div>

      <div className="self-end text-xl">→</div>
    </Link>
  )
}
