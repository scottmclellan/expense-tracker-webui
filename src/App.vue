<template>
  <div class="app">
    <nav-menu/>
    <router-view />
  </div>
</template>

<script>
import NavMenu from "./components/NavMenu.vue";
import {RouterView} from 'vue-router'
export default {
  components: {
    NavMenu,
    RouterView,
  },
  name: "App",
};
</script>

<style scoped>
.app{
  text-align: center;
}

</style>