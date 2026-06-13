'use client'

import CheckableList from './CheckableList'
import { todoStore } from '@/lib/tracker'
import { t } from '@/lib/i18n'

export default function TodoList() {
  return (
    <CheckableList
      title={t.dashboard.todo.title}
      placeholder={t.dashboard.todo.placeholder}
      emptyText={t.dashboard.todo.empty}
      store={todoStore}
    />
  )
}
