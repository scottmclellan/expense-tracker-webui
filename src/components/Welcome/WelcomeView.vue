<template>
    <div>
      <h1>{{ title }}</h1>
      <p>For all your ugly budgeting needs.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WelcomeView',
    data() {
      return {
        title: 'Ugly Budget Expense Tracker',
      };
    },
  };
  </script>