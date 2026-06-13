'use client'

import CheckableList from './CheckableList'
import { shoppingStore } from '@/lib/tracker'
import { t } from '@/lib/i18n'

export default function ShoppingList() {
  return (
    <CheckableList
      title={t.dashboard.shopping.title}
      placeholder={t.dashboard.shopping.placeholder}
      emptyText={t.dashboard.shopping.empty}
      store={shoppingStore}
    />
  )
}
