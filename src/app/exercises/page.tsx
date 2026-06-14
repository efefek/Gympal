import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getExercises, getEquipment } from '@/lib/musclewiki'
import { t } from '@/lib/i18n'
import ExerciseGrid from './ExerciseGrid'

export default async function ExercisesPage(props: {
  searchParams?: Promise<{ search?: string; equipment?: string; muscle?: string }>
}) {
  const sp = await props.searchParams
  const [data, equipmentList] = await Promise.all([
    getExercises({
      search: sp?.search,
      equipment: sp?.equipment,
      muscle: sp?.muscle,
    }),
    getEquipment(),
  ])

  const equipmentFilters = [
    { value: '', label: 'All' },
    ...equipmentList.map((e: string) => ({
      value: e,
      label: e.charAt(0).toUpperCase() + e.slice(1),
    })),
  ]

  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-6 pb-28">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
      >
        <ChevronLeft className="size-3.5" aria-hidden="true" />
        {t.settings.title}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.exercises.title}</h1>
        <p className="text-zinc-500 mt-1 text-sm">1,300+ exercises with animated demos</p>
      </div>

      <ExerciseGrid exercises={data?.exercises ?? []} equipmentFilters={equipmentFilters} />
    </div>
  )
}
