<template>
  <nav>
    <ul>
      <li><RouterLink to="/">Home</RouterLink></li>
      <li><RouterLink v-if="loggedIn" to="/monthly-summary">Monthly Summary</RouterLink></li>
      <li><RouterLink v-if="loggedIn" to="/expense-upload">Expense Upload</RouterLink></li>
      <li><RouterLink v-if="loggedIn" to="/budget-overview">Budget</RouterLink></li>
      <li><RouterLink v-if="loggedIn" to="/account-overview">Account Setup</RouterLink></li>
      <li><RouterLink v-if="!loggedIn" to="/login">Login</RouterLink></li>
      <li v-if="loggedIn" @click="logout">Logout</li>
    </ul>
  </nav>
</template>

<script>
import { RouterLink, useRouter } from "vue-router";
import { useLoginStore } from "./Login/loginStore";
import { computed } from "vue";

export default {
  components: {
    RouterLink,
  },
  setup() {
    const loginStore = useLoginStore();
    const router = useRouter();

    const logout = async ()=>{
        await loginStore.logout()

          // redirect to dashboard on successful logout
          router.push('/');
    }

    return {
      loggedIn: computed(() => loginStore.loggedIn),
      logout
    };
  },
};
</script>

<style scoped>
nav {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

nav ul {
  display: flex;
  flex-direction: row;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav li {
  margin: 0 10px;
}

nav a {
  color: #333;
  text-decoration: none;
}
</style>

