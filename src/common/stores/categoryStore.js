import { defineStore } from 'pinia'
import { fetchCategories } from '@/utilities/fetch'

function organizeCategories(categories, level, result) {
  level++
  return categories.map((cat) => {
    const canSelect = !cat.subcategories || cat.subcategories.length === 0
    const obj = {
      id: cat.id,
      canSelect,
      level,
      description: cat.description
    }
    result.push(obj)
    if (obj.canSelect) return
    organizeCategories(cat.subcategories, level, result)
  })
}

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    all: []
  }),
  getters: {
    organized: (state) => {
      const categoriesOrganized = []
      organizeCategories(state.all, 0, categoriesOrganized)
      return categoriesOrganized
    }
  },
  actions: {
    async fetchCategories() {
      const json = await fetchCategories()
      this.all = json
    }
  }
})
