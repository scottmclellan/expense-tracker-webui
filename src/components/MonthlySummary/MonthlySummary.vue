<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <div>
      <button @click="PreviousMonth">Previous</button>
      <button @click="NextMonth">Next</button>
    </div>
    <el-container>
      <el-header style="height: 100px">
        <h1>{{ currentMonthText }} {{ currentYear }}</h1>
        <p>Total Money Spent: {{ formatCurrency(totalSpent) }}</p>
      </el-header>
      <el-main>
        <div class="summary-tree">
          <el-tree
            :data="categories"
            :props="{ label: 'description', children: 'subcategories' }"
            :render-content="renderContent"
            @node-click="categoryClicked"
          />
        </div>
        <div class="details">
          <div v-if="selectedCategoryId === 0">
            Please select a category to view details.
          </div>
          <div v-else-if="!categoryDetails || categoryDetails?.length === 0">
            No entries for this month.
          </div>
          <div v-else>
            <el-table :data="categoryDetails" style="width: 100%">
              <el-table-column type="expand">
                <template #default="props">
                  <div m="4">
                    <p m="t-0 b-2">Memo: {{ props.row.memo }}</p>
                    <div v-if="props.row.entry_users.length > 0">
                      <h3>Entry Users</h3>
                      <el-table :data="props.row.entry_users">
                        <el-table-column label="First Name" prop="first_name" />
                        <el-table-column label="Last Name" prop="last_name" />
                      </el-table>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Date" prop="{entry_date}">
                <template #default="props">
                  {{ formatDate(props.row.entry_date) }}
                </template>
              </el-table-column>
              <el-table-column label="Account" prop="account_name" />
              <el-table-column label="Payee" prop="payee_name" />
              <el-table-column label="Amount" prop="amount">
                <template #default="props">
                  {{ formatCurrency(props.row.amount) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { getMonthText, currentMonth, currentYear, formatDate } from "../../utilities/date";
import { formatCurrency } from "../../utilities/money";
import { computed, onMounted, ref } from "vue";
import { useMonthlySummaryStore } from "./monthlySummaryStore";

export default {
  setup() {
    const monthlySummaryStore = useMonthlySummaryStore();

    const loading = ref(true);

    onMounted(async () => {
      await LoadingData(() => {
        monthlySummaryStore.fetchMonthlySummary({
          month: currentMonth,
          year: currentYear,
        });
      });
    });

    const renderContent = (h, { node, data }) => {
      return h("span", { class: "node-label" }, [
        h("span", { class: "node-label-description" }, node.label),
        h("span", { class: "node-label-amount" }, formatCurrency(data.amountSpent)),
      ]);
    };

    const categoryClicked = async (selectedCat) => {
     
        monthlySummaryStore.fetchCategoryDetails({
          categoryId: selectedCat.id,
        });
      }

    const NextMonth = async () => {
      await LoadingData(() => {
        monthlySummaryStore.nextMonth();
      });
    };

    const PreviousMonth = async () => {
      await LoadingData(() => {
        monthlySummaryStore.previousMonth();
      });
    };

    const LoadingData = async (dataLoadMethod) => {
      loading.value = true;

      await dataLoadMethod();

      loading.value = false;
    };

   

    return {
      loading,
      totalSpent: computed(() => monthlySummaryStore.totalSpent),
      categories: computed(() => monthlySummaryStore.all),
      categoryDetails: computed(
        () => monthlySummaryStore.categoryDetails
      ),
      selectedCategoryId: computed(
        () => monthlySummaryStore.selectedCategoryId
      ),
      currentMonth: computed(
        () => monthlySummaryStore.currentMonth
      ),
      currentMonthText: computed(() =>
        getMonthText(monthlySummaryStore.currentMonth)
      ),
      currentYear: computed(() => monthlySummaryStore.currentYear),
      renderContent,
      categoryClicked,
      NextMonth,
      PreviousMonth,
      formatDate,
      formatCurrency
    };
  },
};
</script>

<style>
.summary-tree {
}
.node-label {
  display: flex;
  justify-content: space-between;
  min-width: 300px;
}
.node-label-description {
  align-self: flex-start;
  text-align: left;
}

.node-label-amount {
  font-weight: 500;
  align-self: flex-end;
}
</style>

