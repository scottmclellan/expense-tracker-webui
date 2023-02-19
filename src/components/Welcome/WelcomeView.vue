<template>
    <div>
      <h1>{{ title }}</h1>
      <p>Welcome to my expense tracker site!.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WelcomeView',
    data() {
      return {
        title: 'McLellan Family Expense Tracker',
      };
    },
  };
  </script>