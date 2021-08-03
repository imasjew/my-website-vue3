<template>
  <div id="app" >
    <router-view/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',

});
</script>

<style lang="less">
html,body {
  margin: 0;
  width: 100%;
  height: 100%;
}
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: black;
  background-color: gray
}
</style>
