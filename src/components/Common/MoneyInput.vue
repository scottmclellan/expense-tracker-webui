<template>
    <el-input
      v-model="formattedValue"
      @blur="handleBlur"
      @focus="handleFocus"
    ></el-input>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    props: {
      modelValue: Number,
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const formattedValue = ref('');
  
      watch(
        () => props.modelValue,
        (value) => {
          formattedValue.value = value ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
        },
        { immediate: true }
      );
  
      const handleBlur = () => {
        const parsedValue = parseFloat(formattedValue.value.replace(/[^0-9-.]+/g, ''));
        if (!isNaN(parsedValue)) {
          emit('update:modelValue', parsedValue);
          formattedValue.value = parsedValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        } else {
          emit('update:modelValue', null);
          formattedValue.value = '';
        }
      };
  
      const handleFocus = (event) => {
        event.target.select();
      };
  
      return {
        formattedValue,
        handleBlur,
        handleFocus,
      };
    },
  };
  </script>
  