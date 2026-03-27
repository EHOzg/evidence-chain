<template>
  <div class="app-container">
    <WindowBar />

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import WindowBar from '@/components/window-bar/index.vue'
</script>

<style>
.main-content {
  height: calc(100vh - 30px);
  width: 100%;
  padding-top: 30px;
  overflow: auto;
}
</style>
