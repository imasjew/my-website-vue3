<template>
  <div>
    您没有登录！<br>
    {{time}}秒后自动跳转到<span class="login-page-btn" @click="goLoggin()">登录页</span>
  </div>
</template>

<script lang="ts">
import { ref } from '@vue/reactivity';
import { useRouter } from 'vue-router';
import { onMounted } from '@vue/runtime-core';
export default {
  name: 'errorpage',
  setup() {
    const time = ref(5);
    const timer = ref();
    const router = useRouter()


    onMounted(() => {
      timer.value = setInterval(() => {
      setTime();
      if (time.value < 1) {
        clearInterval(timer.value);
        goLoggin()
      }
    }, 1000);
    })
    const setTime = () => {
      time.value--;
    }
    const goLoggin = () => {
      clearInterval(timer.value);
      router.push('/login');
    }

    return {
      time,
      goLoggin,
    }
  }
}
</script>

<style>
.login-page-btn {
  color: blue;
  cursor: pointer;
}
</style>
