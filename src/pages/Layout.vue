<template>
  <el-container class="layout-wrapper">
    <el-header>
      <el-menu
        :default-active="activeIndex"
        class="menu-color"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-menu-item index="shopping">购物</el-menu-item>
        <el-menu-item index="music">音乐</el-menu-item>
        <el-menu-item index="game">游戏</el-menu-item>
        <el-submenu index="options" class="options">
          <template #title>个人中心</template>
          <el-menu-item index="options" disabled>资料设置</el-menu-item>
          <el-menu-item index="logout">注销</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-container>
      <router-view />
    </el-container>
  </el-container>
</template>

<script lang="ts">
import accountService from "@/service/account.service";
import { ref } from '@vue/reactivity';
import { onMounted } from '@vue/runtime-core';
import { useRoute, useRouter } from 'vue-router';
export default {
  name: "layout",
  setup() {
    const activeIndex = ref("");
    const Routes = ref(["dashboard", "shopping", "music", "game"])
    const router = useRouter();
    const route = useRoute();

    onMounted(() => {
      const rootRoute = checkSameRoutes();
      activeIndex.value = rootRoute;
    })


    const handleSelect = (key: string) => {
      if (key === "logout") {
        accountService.logout();
        router.push("/login");
        return;
      }
      // 避免已在该标签下时，额外跳转，丢失子路由
      const adress = "home/" + key;
      if (route.fullPath.indexOf(adress) >= 0) {
        return;
      }
      router.push("/home/" + key);
    }
    const checkSameRoutes = () => {
      const routesLen = Routes.value.length;
      for (let i = 0; i < routesLen; i++) {
        if (route.fullPath.indexOf(Routes.value[i]) >= 0) {
          return Routes.value[i];
        }
      }
      return Routes.value[0];
    }

    return {
      activeIndex,
      Routes,
      handleSelect,
    }
  }



};
</script>

<style lang="less" scoped>
.layout-wrapper {
  height: 100%;
  .el-header {
    padding: 0;
  }
  .menu-color {
    background-color: gray;
  }
  .options {
    float: right;
  }
}
</style>
