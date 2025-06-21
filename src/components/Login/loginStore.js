import { defineStore } from 'pinia'
import { currentUri } from '@/utilities/fetch'

export const useLoginStore = defineStore('loginStore', {
  state: () => ({
    loggedIn: false,
    user: null
  }),
  actions: {
    async login(credentials) {
      const response = await fetch(`${currentUri}/api/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        this.loggedIn = true
        this.user = await response.json()
      } else {
        throw new Error('Login failed')
      }
    },
    async logout() {
      const response = await fetch(`${currentUri}/api/logout`, {
        method: 'POST',
        body: JSON.stringify({ email: this.user?.email }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        this.loggedIn = false
        this.user = null
      } else {
        throw new Error('Logout failed')
      }
    }
  }
})
