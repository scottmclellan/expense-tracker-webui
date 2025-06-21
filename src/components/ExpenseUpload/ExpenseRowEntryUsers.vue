<template>
  <div>
    <label v-for="(entryUser, index) in entryUsers" :key="index">
      <input
        type="checkbox"
        v-model="local.entry_users"
        @change="entryUserChanged"
        :value="entryUser.id"
      />
      {{ `${entryUser.first_name} ${entryUser.last_name}` }}
    </label>
    <el-button v-if="!allSelected" type="primary" @click="selectAllUsers"> Select All </el-button>
    <el-button v-if="allSelected" type="primary" @click="clearAllUsers"> Clear </el-button>
  </div>
</template>

<script>
import { reactive, computed } from "vue";
import { useEntryUsersStore } from "../../common/stores/entryUsersStore";

export default {
  props: {
    entry_users: Array,
  },
  setup(props, { emit }) {
    const entryUsersStore = useEntryUsersStore();

    const local = reactive({
      entry_users: props.entry_users,
    });

    const entryUsers = computed(() => entryUsersStore.all);

    const entryUserChanged = () => {
      emit("entryUsersChanged", { selected: local.entry_users });
    };

    const selectAllUsers = () => {
      local.entry_users = entryUsers.value.map((x) => x.id);
      emit("entryUsersChanged", { selected: local.entry_users });
    };

    const  clearAllUsers = () => {
      local.entry_users = [];
      emit("entryUsersChanged", { selected: local.entry_users });
    };

    return {
      local,
      localEntryUsers: local.entry_users,
      allSelected: computed(()=> local.entry_users.length === entryUsers.value.length),
      entryUsers,
      entryUserChanged,
      selectAllUsers,
      clearAllUsers
    };
  },
};
</script>

<style scoped>
</style>

