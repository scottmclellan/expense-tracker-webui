<template>
  <el-container>
    <el-header style="height:100px">
      <h1>{{ currentMonth }}</h1>
      <p>Total Money Spent: {{ totalSpent }}</p>
    </el-header>
    <el-main>
      <el-tree
        :data="categories"
        :props="{ label: 'name', children: 'subCategories' }"
        :render-content="renderContent"
      />
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      currentMonth: "February 2023",
      totalSpent: "$1,000",
      categories: [
        {
          name: "Food",
          amountSpent: "$500",
          subCategories: [
            {
              name: "Restaurants",
              amountSpent: "$200",
            },
            {
              name: "Grocery",
              amountSpent: "$300",
            },
          ],
        },
        {
          name: "Transportation",
          amountSpent: "$300",
          subCategories: [
            {
              name: "Gas",
              amountSpent: "$100",
            },
            {
              name: "Public Transportation",
              amountSpent: "$200",
            },
          ],
        },
        {
          name: "Entertainment",
          amountSpent: "$200",
        },
      ],
    };
  },
  methods: {
    renderContent(h, { node, data }) {
      return h("span", [
        h("span", node.label),
        h("span", { style: { float: "right" } }, data.amountSpent),
      ]);
    },
  },
};
</script>
