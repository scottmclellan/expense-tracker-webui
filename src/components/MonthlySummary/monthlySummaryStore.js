export const monthlySummaryStore = {
  namespaced: true,
  state() {
    return {
      all: [],
      totalSpent: 0,
      currentMonth: 0,
      currentYear: 0,
      selectedCategoryId: 0,
      categoryDetails: [],
    };
  },
  mutations: {
    setSummary(state, summary) {
      state.all = summary;
      state.totalSpent = CalcTotalSpent(summary);
      state.selectedCategoryId = 0;
      state.categoryDetails = [];
    },
    setCurrentMonth(state, currentMonth) {
      state.currentMonth = currentMonth;
    },
    setCurrentYear(state, currentYear) {
      state.currentYear = currentYear;
    },
    setSelectedCategoryId(state, categoryId) {
      console.log(categoryId);
      state.selectedCategoryId = categoryId;
    },
    setCategoryDetails(state, categoryDetails) {
      console.log(categoryDetails);
      state.categoryDetails = categoryDetails;
    },
  },
  actions: {
    async fetchMonthlySummary(ctx, { month, year }) {
      const res = await window.fetch(
        `http://localhost:3000/api/summary/${year}/${month+1}`
      );
      const json = await res.json();
      ctx.commit("setSummary", json);
      ctx.commit("setCurrentMonth", month);
      ctx.commit("setCurrentYear", year);
    },
    async fetchCategoryDetails(ctx, { categoryId }) {
      const res = await window.fetch(
        `http://localhost:3000/api/entry/category/${ctx.state.currentYear}/${ctx.state.currentMonth+1}/${categoryId}`
      );

      if (res.status === 404) {
        ctx.commit("setSelectedCategoryId", categoryId);
        ctx.commit("setCategoryDetails", undefined);
      } else {
        const json = await res.json();
        ctx.commit("setSelectedCategoryId", categoryId);
        ctx.commit("setCategoryDetails", json);
      }
    },
    nextMonth(ctx) {
      let nextMonth = ctx.state.currentMonth + 1
      if(nextMonth === 12)
      {
        nextMonth = 0;
        ctx.commit("setCurrentYear", ctx.state.currentYear+1)
      }
      ctx.commit("setCurrentMonth", nextMonth);
      ctx.dispatch("fetchMonthlySummary", {
        month: ctx.state.currentMonth,
        year: ctx.state.currentYear,
      });
    },
    previousMonth(ctx) {
      let prevMonth = ctx.state.currentMonth - 1
      if(prevMonth === -1)
      {
        prevMonth = 11;
        ctx.commit("setCurrentYear", ctx.state.currentYear-1)
      }
      ctx.commit("setCurrentMonth", prevMonth);
      ctx.dispatch("fetchMonthlySummary", {
        month: ctx.state.currentMonth,
        year: ctx.state.currentYear,
      });
    },
  },
};

function CalcTotalSpent(categories) {
  let acc = 0;

  for (let index = 0; index < categories.length; index++) {
    const cat = categories[index];

    acc += cat.amountSpent;
  }

  return acc;
}
