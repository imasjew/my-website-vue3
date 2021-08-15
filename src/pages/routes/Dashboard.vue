<template>
  <div class="page-wrapper">
    <div class="title">Dashboard</div>
    <el-button @click="checkAuth()" class="check-btn">校验登录状态</el-button>
  </div>
</template>

<script lang="ts">
import httpService from "@/service/http.service";
import accountService from "@/service/account.service";
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { showReject, showSuccess } from '@/utils/commonUtils';

export default {
  name: "dashboard",
  setup() {
    onMounted(() => {
      checkAuth()
    })
    const router = useRouter();
    const checkAuth = () => {
      httpService.auth().then(
        (res: any) => {
          showSuccess(res.message);
        },
        (err) => {
          showReject(err.data.message);
          router.push('/errorpage');
          accountService.logout();
        }
      );
    }
    return {
      checkAuth
    }
  }
};
</script>

<style lang="less">
.page-wrapper {
  position: relative;
  width: 100%;
  .title {
    position: absolute;
    top: -24px;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    line-height: 100px;
    height: 100px;
    font-size: 58px;
    font-weight: 600;
  }
  .check-btn {
    margin-top: 40px;
  }
}
</style>
