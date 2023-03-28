<template>
  <div v-if="useExistingPayee">
    <select v-model="localPayee.payee_id" @change="payeeSelected">
      <option v-for="payee in payees" :key="payee.id" :value="payee.id">
        {{ payee.name }}
      </option>
    </select>
    <el-button type="primary" @click="useExistingPayee = !useExistingPayee"> Add Payee </el-button>
  </div>  
  <div v-else>
    <p>Enter payee description</p>
    <input
      type="text"
      :value="localPayee.payee_system_description"
      @change="payeeSystemDescriptionChanged"
    />
    <el-button type="primary" @click="useExistingPayee = !useExistingPayee"> Select Existing </el-button>   
  </div>
</template>

<script>
import { reactive, computed, ref } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    payee: Object,
  },
  setup(props, { emit }) {
    const store = useStore();

    const localPayee = reactive({ ...props.payee });

    const useExistingPayee = ref(false) 

    useExistingPayee.value = localPayee.payee_id && localPayee.payee_id > 0;

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
      useExistingPayee,
      localPayee,
      payees: computed(() => store.getters["payeeStore/sortedAll"]),
      payeeSystemDescriptionChanged,
      payeeSelected,
    };
  },
};
</script>

<style scoped></style>
