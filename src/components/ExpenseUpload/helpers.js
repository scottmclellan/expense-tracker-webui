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

  module.exports = {
    organizeCategories,
  };
  