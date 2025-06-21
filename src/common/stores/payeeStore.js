import { defineStore } from 'pinia'
import { fetchPayees } from '@/utilities/fetch'
import { addPayee } from '@/utilities/api'

export const usePayeeStore = defineStore('payeeStore', {
  state: () => ({
    all: []
  }),
  getters: {
    sortedAll: (state) => {
      if (state.all && state.all.length > 0) {
        return state.all.sort((a, b) => a.name.localeCompare(b.name))
      }
      return []
    }
  },
  actions: {
    async fetchPayees() {
      const json = await fetchPayees()
      this.all = json ?? []
    },
    async addPayee({ payee_system_description, payee_bank_description, category }) {
      const json = await addPayee(
        payee_system_description,
        payee_bank_description,
        category
      )
      this.all.push(json)
      return json
    }
  }
})
