<template>
  <div class="page-wrapper">
    <div class="title">Dashboard</div>
    <el-button @click="checkAuth()" class="check-btn">校验登录状态</el-button>
  </div>
</template>

<script>
import httpService from "@/service/http.service";
import accountService from "@/service/account.service";
import { ElNotification } from 'element-plus'
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'

export default {
  name: "dashboard",
  setup() {
    onMounted(() => {
      checkAuth()
    })
    const router = useRouter();
    const checkAuth = () => {
      httpService.auth().then(
        (res) => {
          showSuccess(res.message);
        },
        (err) => {
          showReject(err.data.message);
          router.push("/errorpage");
          accountService.logout();
        }
      );
    }
    const showSuccess = (title, msg) => {
      ElNotification({
        title: title,
        message: msg,
        type: "success",
      });
    }
    const showReject = (title, msg) => {
      ElNotification({
        title: title,
        message: msg,
      });
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
