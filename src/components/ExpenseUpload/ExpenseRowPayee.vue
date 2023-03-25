<template>
  <div>
    <p>Enter payee description</p>
    <input
      type="text"
      :value="localPayee.payee_system_description"
      @change="payeeSystemDescriptionChanged"
    />
    <p>Or select existing payee</p>
    <select v-model="localPayee.payee_id" @change="payeeSelected">
      <option v-for="payee in payees" :key="payee.id" :value="payee.id">
        {{ payee.name }}
      </option>
    </select>
  </div>
</template>

<script>
import { reactive, computed } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    payee: Object,
  },
  setup(props, { emit }) {
    const store = useStore();

    const localPayee = reactive({ ...props.payee });

    const payeeSystemDescriptionChanged = () => {
      emit("payeeUpdated", {
        ...localPayee,
        payee_id: 0,
      });
    };

    const payeeSelected = (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const value = selectedOption.value;
      const text = selectedOption.text;
      emit("payeeUpdated", {
        ...localPayee,
        payee_system_description: text,
        payee_id: value,
      });
    };

    return {
      localPayee,
      payees: computed(() => store.getters["payeeStore/sortedAll"]),
      payeeSystemDescriptionChanged,
      payeeSelected,
    };
  },
};
</script>

<style scoped></style>
