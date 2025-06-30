<template>
  <div class="my-avatar">
    <el-popover
      placement="top"
      :popper-style="{
        width: 'auto',
        minWidth: '30px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }"
      trigger="hover"
      :content="user"
    >
      <template #reference>
        <el-avatar :size="size">{{ user.charAt(0) }}</el-avatar>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  const props = defineProps({
    user: {
      type: String,
      default: '张三',
    },
    size: {
      type: Number,
      default: '24',
    },
  });
</script>
<style scoped>
  .my-avatar {
    cursor: pointer;
  }
</style>
