'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Exercise } from '@/lib/musclewiki'
import { getProfile, mapProfileEquipmentToApi, equipmentLabels } from '@/lib/profile'
import ExerciseMedia from '@/components/ExerciseMedia'
import { t } from '@/lib/i18n'

const PAGE_SIZE = 24

interface EquipmentFilter {
  value: string
  label: string
  icon?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function ExerciseGrid({
  exercises,
  equipmentFilters: rawFilters,
}: {
  exercises: Exercise[]
  equipmentFilters: EquipmentFilter[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRender = useRef(true)

  const activeEquipment = searchParams.get('equipment') || ''
  const activeMuscle = searchParams.get('muscle') || ''
  const urlSearch = searchParams.get('search') || ''

  const [query, setQuery] = useState(urlSearch)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedQuery) {
      params.set('search', debouncedQuery)
    } else {
      params.delete('search')
    }
    router.replace(`/exercises?${params.toString()}`, { scroll: false })
  }, [debouncedQuery, router, searchParams])

  const allMuscles = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach((e) => set.add(e.muscle))
    return Array.from(set).sort()
  }, [exercises])

  const profile = useMemo(() => getProfile(), [])
  const userApiEquipment = useMemo(
    () => (profile ? mapProfileEquipmentToApi(profile.equipment) : null),
    [profile]
  )
  const userEquipmentSet = useMemo(
    () => (userApiEquipment ? new Set(userApiEquipment) : null),
    [userApiEquipment]
  )

  const [showProfileFilter, setShowProfileFilter] = useState(!!profile)

  const visibleEquipmentFilters = useMemo(() => {
    if (profile && showProfileFilter && userEquipmentSet) {
      return rawFilters.filter(
        (f) => f.value === '' || userEquipmentSet.has(f.value.toLowerCase())
      )
    }
    return rawFilters
  }, [rawFilters, profile, showProfileFilter, userEquipmentSet])

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/exercises?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const q = debouncedQuery.toLowerCase()
      const matchesSearch = !debouncedQuery || e.name.toLowerCase().includes(q)
      const matchesMuscle = !activeMuscle || e.muscle === activeMuscle

      let matchesEquipment = true
      if (activeEquipment) {
        matchesEquipment = e.equipment === activeEquipment
      } else if (profile && showProfileFilter && userEquipmentSet) {
        matchesEquipment = userEquipmentSet.has(e.equipment)
      }

      return matchesSearch && matchesEquipment && matchesMuscle
    })
  }, [exercises, debouncedQuery, activeEquipment, activeMuscle, profile, showProfileFilter, userEquipmentSet])

  // Pagination is keyed by the active filter so it auto-resets to the first page
  // when filters change — derived during render, no ref or effect needed.
  const filterKey = `${debouncedQuery}|${activeEquipment}|${activeMuscle}|${showProfileFilter}`
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE })
  const visibleCount = page.key === filterKey ? page.count : PAGE_SIZE

  const visible = filtered.slice(0, visibleCount)
  const hasFilters = activeEquipment || activeMuscle || urlSearch

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full min-w-0">
        <div className="relative w-full min-w-0 sm:max-w-md">
          <label htmlFor="exercise-search" className="sr-only">Search exercises</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 pointer-events-none" aria-hidden="true" />
          <input
            id="exercise-search"
            type="text"
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-800 bg-surface-1 py-3 pl-11 pr-11 text-sm text-foreground placeholder-zinc-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1" role="group" aria-label="Filter by muscle group">
          <button
            type="button"
            aria-pressed={activeMuscle === ''}
            onClick={() => applyFilter('muscle', '')}
            className={`tap-scale shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              activeMuscle === ''
                ? 'bg-primary text-black shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'border border-zinc-800 bg-surface-1 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          {allMuscles.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={activeMuscle === m}
              onClick={() => applyFilter('muscle', activeMuscle === m ? '' : m)}
              className={`tap-scale shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors capitalize ${
                activeMuscle === m
                  ? 'bg-primary text-black shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                  : 'border border-zinc-800 bg-surface-1 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {profile && (
          <button
            type="button"
            aria-pressed={showProfileFilter}
            onClick={() => setShowProfileFilter(!showProfileFilter)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              showProfileFilter
                ? 'bg-primary text-black shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            My Equipment
          </button>
        )}
      </div>

      {profile && showProfileFilter && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary-dim/30 px-4 py-2.5 text-sm text-zinc-300">
          {profile.location === 'gym'
            ? 'Gym access — showing all exercises'
            : `Showing exercises for: ${profile.equipment.map((e) => equipmentLabels[e]).join(', ')}`}
        </div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {visibleEquipmentFilters.map((eq) => (
          <button
            key={eq.value}
            type="button"
            aria-pressed={activeEquipment === eq.value}
            onClick={() => applyFilter('equipment', eq.value === activeEquipment ? '' : eq.value)}
            className={`tap-scale flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeEquipment === eq.value
                ? 'bg-primary text-black shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'bg-surface-1 text-zinc-400 hover:bg-surface-3 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {eq.icon && <span>{eq.icon}</span>} {eq.label}
          </button>
        ))}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push('/exercises')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-5 transition-colors"
        >
          <X className="size-3" aria-hidden="true" /> Clear all filters
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((exercise) => (
          <div
            key={exercise.id}
            className="tap-scale group relative rounded-2xl border border-zinc-800 bg-surface-1 overflow-hidden transition-colors hover:border-primary/40 hover:bg-surface-2 hover:shadow-[0_0_30px_rgba(57,255,20,0.06)]"
          >
            <div className="relative aspect-square bg-surface-3/50">
              <ExerciseMedia
                slug={exercise.slug}
                gifUrl={exercise.gifUrl}
                alt={exercise.name}
                className="size-full object-contain p-2"
              />
            </div>

            <div className="p-3.5">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                {exercise.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                <span className="rounded-md bg-primary-dim px-2 py-0.5 text-[11px] font-medium text-primary leading-normal">
                  {exercise.muscle.charAt(0).toUpperCase() + exercise.muscle.slice(1)}
                </span>
                {exercise.secondaryMuscles?.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400 leading-normal"
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-600">
                <span className="rounded bg-zinc-800/50 px-1.5 py-0.5">
                  {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                </span>
                <span className="text-zinc-700">&middot;</span>
                <span>{exercise.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <div className="size-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-4">
            <Search className="size-5" />
          </div>
          <p className="text-sm font-medium">No exercises found</p>
          <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {filtered.length > visibleCount && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setPage({ key: filterKey, count: visibleCount + PAGE_SIZE })}
            className="tap-scale rounded-full border border-zinc-800 bg-surface-1 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-primary/40 hover:text-primary"
          >
            {t.exercises.loadMore}
          </button>
        </div>
      )}

      <div role="status" aria-live="polite" className="mt-4 text-xs text-zinc-600 text-center">
        {t.exercises.showing} {visible.length} {t.exercises.of} {filtered.length}
      </div>
    </>
  )
}
