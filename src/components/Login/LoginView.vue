<template>
    <form @submit.prevent="login">
      <label>
        Email:
        <input type="email" v-model="email">
      </label>
      <label>
        Password:
        <input type="password" v-model="password">
      </label>
      <button type="submit">Login</button>
    </form>
  </template>
  
  <script>
  import { useStore} from 'vuex';
  import {useRouter} from 'vue-router'
  import {ref} from 'vue'

export default {
  name: 'LoginView',
  setup() {
    const store = useStore();
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    console.log(store)

    const login = async () => {
      try {
        await store.dispatch('loginStore/login', {
          email: email.value,
          password: password.value,
        });

        // redirect to dashboard on successful login
        router.push('/monthly-summary');
      } catch (error) {
        console.error(error);
        alert('Login failed');
      }
    };

    return {
      email,
      password,
      login,
    };
  },
};

  </script>
  