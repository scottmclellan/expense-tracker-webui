<template>
  <select v-model="selectedCategory" @change="categoryChanged">
        <option
          v-for="category in categoriesOrganized"
          :key="category.id"
          :value="category.id"
          :disabled="!category.canSelect"
        >
          {{ category.description }}
        </option>
      </select>
</template>

<script>
import { watch, computed, ref } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    category: Number,
  },
  setup(props, { emit }) {
    const store = useStore();

    const selectedCategory = ref(props.category);

    watch(()=> props.category, (newValue)=>{
      selectedCategory.value = newValue;
    });

    const categoryChanged = () => {
      emit("categoryChanged", {selected:selectedCategory.value});
    };
   
    return {
      selectedCategory,
      categoriesOrganized: computed(() => store.getters["categoryStore/organized"]),
      categoryChanged,
    };
  },
};
</script>

<style scoped></style>
