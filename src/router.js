import { createRouter, createWebHistory } from "vue-router";
import MonthlySummary from "./components/MonthlySummary/MonthlySummary.vue";
import ExpenseUpload from "./components/ExpenseUpload/ExpenseUpload.vue";
import WelcomeView from "./components/Welcome/WelcomeView.vue";
import BudgetOverview from "./components/Budget/BudgetOverview.vue";
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
    path: "/login",
    component: LoginView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
