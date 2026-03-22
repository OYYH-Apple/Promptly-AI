<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />
    <main class="flex-1 ml-72 flex flex-col overflow-hidden">
      <TopBar />
      <router-view />
    </main>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import Toast from '@/components/Toast.vue'
</script>
