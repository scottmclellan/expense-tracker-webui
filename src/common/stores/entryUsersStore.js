import { fetchEntryUsers } from "@/utilities/fetch";


export const entryUsersStore = {
  namespaced: true,
  state() {
    return {
      all: [],
    };
  }, 
  mutations: {
    setEntryUsers(state, entryUsers) {
      state.all = entryUsers;
    },
    addEntryUser(state, entryUser) {
      state.all.push(entryUser);
    },
  },
  actions: {
    async fetchEntryUsers(ctx) {
      const json = await fetchEntryUsers();

      ctx.commit("setEntryUsers", json);
    },
  },
};
