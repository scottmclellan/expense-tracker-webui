<template>
    <el-upload
      class="upload-demo"
      action="//localhost:3000/api/expenseupload/"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
      :file-list="fileList"
      :multiple="false"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :limit="1"
      :auto-upload="true"
    >
      <el-button size="small" type="primary">Click to upload</el-button>
      <template class="el-upload__tip">
        Please upload a file less than 2MB
      </template>
    </el-upload>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { ElUpload, ElButton } from 'element-plus';
  
  export default {
    components: {
      ElUpload,
      ElButton,
    },
    setup() {
      const fileList = ref([]);
  
      const handlePreview = (file) => {
        console.log(file);
      };
  
      const handleRemove = (file) => {
        console.log(file, fileList.value);
      };
  
      const beforeRemove = () => {
        return window.confirm('Are you sure you want to delete this file?');
      };
  
      const handleExceed = (files) => {
        this.$message.warning(`The limit is 3, you selected ${files.length} files this time, please delete some files.`);
      };
  
      const handleSuccess = (response, file, fileList) => {
        console.log(response, file, fileList);
      };
  
      return {
        fileList,
        handlePreview,
        handleRemove,
        beforeRemove,
        handleExceed,
        handleSuccess,
      };
    },
  };
  </script>
  
  <style scoped>
  .upload-demo {
    display: flex;
    flex-wrap: wrap;
  }
  .upload-demo > * {
    margin-right: 10px;
  }
  </style>
  