import { fetchCategories } from "@/utilities/fetch";

function organizeCategories(categories, level, result) {
  level++;

  return categories.map((cat) => {
    const canSelect = !cat.subcategories || cat.subcategories.length === 0;

    var obj = {
      id: cat.id,
      canSelect: canSelect,
      level: level,
      description: cat.description,
    };

    result.push(obj);

    if (obj.canSelect) return;

    organizeCategories(cat.subcategories, level, result);
  });
}

export const categoryStore = {
  namespaced: true,
  state() {
    return {
      all: [],
    };
  },
  getters: {
    organized: (state) => {
      let categoriesOrganized = [];
      organizeCategories(state.all, 0, categoriesOrganized);
      return categoriesOrganized;
    },
  },
  mutations: {
    setCategories(state, categories) {
      state.all = categories;
    },
    addCategory(state, category) {
      state.all.push(category);
    },
  },
  actions: {
    async fetchCategories(ctx) {
      const json = await fetchCategories();

      ctx.commit("setCategories", json);
    },
  },
};
