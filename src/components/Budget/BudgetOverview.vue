<template>
    <div>
      <h1>{{ title }}</h1>
      <p>This is the Budget component.</p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BudgetOverview',
    data() {
      return {
        title: 'Budget Overview',
      };
    },
  };
  </script>