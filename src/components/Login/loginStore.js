export const loginStore = {
  namespaced: true,
  state() {
    return {
      loggedIn: false,
      user: null,
    };
  },
  mutations: {
    login(state, user) {
      state.loggedIn = true;
      state.user = user;
    },
    logout(state) {
      state.loggedIn = false;
      state.user = null;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      // perform authentication request
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const user = await response.json();
        commit("login", user);
      } else {
        throw new Error("Login failed");
      }
    },
    async logout(ctx) {
      // perform logout request
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        body: JSON.stringify({ email: ctx.state.user.email }),
        headers: {
            "Content-Type": "application/json",
          },
      });

      if (response.ok) {
        ctx.commit("logout");
      } else {
        throw new Error("Logout failed");
      }
    },
  },
};
