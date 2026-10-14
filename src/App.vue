<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main id="main-content" class="page-shell">
      <RouterView />
    </main>
    <footer class="site-footer">
      <p>MClimateWise Mel · Practical climate learning for Melbourne communities</p>
    </footer>
  </div>
</template>
