
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  background: #070513;
  color: #fff;
}

body {
  overflow-x: hidden;
}

button,
input {
  font: inherit;
}
</style>
