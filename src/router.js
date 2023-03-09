import { createRouter, createWebHistory } from "vue-router";
import MonthlySummary from "./components/MonthlySummary/MonthlySummary.vue";
import ExpenseUpload from "./components/ExpenseUpload/ExpenseUpload.vue";
import WelcomeView from "./components/Welcome/WelcomeView.vue";
import BudgetOverview from "./components/BudgetOverview/BudgetOverview.vue";
import AccountOverview from "./components/AccountOverview/AccountOverview.vue";
import AccountEdit from "./components/AccountOverview/AccountEdit.vue";
import LoginView from "./components/Login/LoginView.vue";

const routes = [
  {
    path: "/",
    component: WelcomeView,
  },
  {
    path: "/monthly-summary",
    component: MonthlySummary,
  },
  {
    path: "/expense-upload",
    component: ExpenseUpload,
  },
  {
    path: "/budget-overview",
    component: BudgetOverview,
  },
  {
    path: "/account-overview",
    component: AccountOverview,
  },
  {
    path: "/account-overview/:id",
    component: AccountEdit,
  },
  {
    path: "/account-overview/new",
    component: AccountEdit,
  },
  {
    path: "/login",
    component: LoginView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
