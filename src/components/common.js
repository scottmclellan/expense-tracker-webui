const MODES = { PRE_EDIT: "preedit", EDIT: "edit", ADD: "add" };

const debounce = (fn, delay) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    MODES,
    debounce,
    deepClone
  };