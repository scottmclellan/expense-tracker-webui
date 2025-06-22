import { defineStore } from 'pinia'
import { fetchMonthlySummary, fetchCategoryDetails } from '@/utilities/fetch'

export const useMonthlySummaryStore = defineStore('monthlySummaryStore', {
  state: () => ({
    all: [],
    totalSpent: 0,
    currentMonth: 0,
    currentYear: 0,
    selectedCategoryId: 0,
    categoryDetails: []
  }),
  actions: {
    async fetchMonthlySummary({ month, year }) {
      const json = await fetchMonthlySummary(year, month + 1)
      this.all = json
      this.totalSpent = CalcTotalSpent(json)
      this.selectedCategoryId = 0
      this.categoryDetails = []
      this.currentMonth = month
      this.currentYear = year
    },
    async fetchCategoryDetails({ categoryId }) {
      const json = await fetchCategoryDetails(
        this.currentYear,
        this.currentMonth + 1,
        categoryId
      )
      this.selectedCategoryId = categoryId
      this.categoryDetails = json || undefined
    },
    async nextMonth() {
      let nextMonth = this.currentMonth + 1
      if (nextMonth === 12) {
        nextMonth = 0
        this.currentYear += 1
      }
      this.currentMonth = nextMonth
      await this.fetchMonthlySummary({
        month: this.currentMonth,
        year: this.currentYear
      })
    },
    async previousMonth() {
      let prevMonth = this.currentMonth - 1
      if (prevMonth === -1) {
        prevMonth = 11
        this.currentYear -= 1
      }
      this.currentMonth = prevMonth
      await this.fetchMonthlySummary({
        month: this.currentMonth,
        year: this.currentYear
      })
    }
  }
})

function CalcTotalSpent(categories) {
  let acc = 0
  for (let index = 0; index < categories.length; index++) {
    const cat = categories[index]
    acc += cat.amountSpent
  }
  return acc
}
