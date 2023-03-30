<template>
  <div>
    <el-autocomplete
      v-model="localPayeeDescription"
      :fetch-suggestions="querySearch"
      :class="{
        'existing-payee': localPayee.payee_id && localPayee.payee_id > 0,
        'new-payee': !localPayee.payee_id || localPayee.payee_id <= 0,
      }"
      placeholder="Enter payee description or select existing"
      @select="handleSelect"
    >
      <template #default="{ item }">
        <div class="name">{{ item.name }}</div>
      </template>
    </el-autocomplete>
  </div>
</template>

<script>
import { reactive, ref, watch } from "vue";
import { useStore } from "vuex";

export default {
  props: {
    payee: Object,
  },
  setup(props, { emit }) {
    const store = useStore();

    const localPayee = reactive({ ...props.payee });
    const localPayeeDescription = ref(
      localPayee.payee_system_description || ""
    );

    const querySearch = (queryString, callback) => {
      callback(findPayee(queryString));
    };

    const findPayee = (queryString) => {
      return store.getters["payeeStore/sortedAll"].filter((payee) => {
        return payee.name.toLowerCase().includes(queryString.toLowerCase());
      });
    };

    const findPayeeExactMatch = (queryString) => {
      return store.getters["payeeStore/sortedAll"].filter((payee) => {
        return payee.name.toLowerCase() === queryString.toLowerCase();
      });
    };

    const handleSelect = (item) => {
      localPayeeDescription.value = item.name;
      localPayee.payee_system_description = item.name;
      localPayee.payee_id = item.id;

      emit("payeeUpdated", {
        ...localPayee,
        payee_system_description: item.name,
        payee_id: item.id,
      });
    };

    watch(
      () => localPayeeDescription.value,
      (newValue, oldValue) => {
        if (newValue === oldValue) return;

        localPayee.payee_system_description = newValue;

        const result = findPayeeExactMatch(newValue);

        if (result && result.length === 1) {
          console.log(result)
          localPayee.payee_id = result[0].id;
          localPayee.payee_system_description = localPayeeDescription.value = result[0].name;

          emit("payeeUpdated", {
            ...localPayee,
          });
        }
        else{
          emit("payeeUpdated", {
            ...localPayee,
            payee_id:0,
            payee_system_description : newValue
          })
        }
      }
    );

    return {
      localPayee,
      localPayeeDescription,
      querySearch,
      handleSelect,
    };
  },
};
</script>

<style scoped>
.existing-payee .el-input__inner {
  background-color: lightgreen;
  color: darkgreen;
}

.new-payee .el-input__inner {
  background-color: lightyellow;
  color: darkgoldenrod;
}
</style>
