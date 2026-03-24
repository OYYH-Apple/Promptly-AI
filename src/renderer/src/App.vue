<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <TitleBar />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 ml-20 flex flex-col overflow-hidden">
        <TopBar />
        <router-view />
      </main>
    </div>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import TopBar from '@/components/TopBar.vue'
import Toast from '@/components/Toast.vue'
import TitleBar from '@/components/TitleBar.vue'
</script>
