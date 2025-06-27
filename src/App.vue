<template>
  <el-config-provider :locale="locale">
    <el-container class="app-container">
      <Sidebar v-if="meta" />
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<script setup>
  import Sidebar from '@/components/Sidebar.vue';
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
  import { watch, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const meta = ref(false);
  const locale = ref(zhCn);

  onMounted(() => {
    meta.value = router.currentRoute.value.meta.requiresAuth;
  });
  watch(
    () => router.currentRoute.value,
    () => {
      meta.value = router.currentRoute.value.meta.requiresAuth;
    }
  );
</script>

<style lang="scss">
  @font-face {
    font-family: 'AlibabaPuHui3';
    src: url('@/assets/fonts/AlibabaPuHuiTiMedium.ttf');
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'AlibabaPuHui3';
    background-color: #f5f7fa;
  }

  #app {
    height: 100vh;
  }

  .app-container {
    height: 100%;
  }

  .main-content {
    padding: 0;
    background-color: #f5f7fa;
  }
</style>
