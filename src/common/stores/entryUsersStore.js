import { defineStore } from 'pinia'
import { fetchEntryUsers } from '@/utilities/fetch'

export const useEntryUsersStore = defineStore('entryUsersStore', {
  state: () => ({
    all: []
  }),
  actions: {
    async fetchEntryUsers() {
      const json = await fetchEntryUsers()
      this.all = json
    }
  }
})
