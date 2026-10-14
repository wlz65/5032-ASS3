<template>
  <section class="not-found card">
    <span class="status-code">404</span>
    <p class="eyebrow">Page not found</p>
    <h1>This path is off the map.</h1>
    <p class="lede">The page may have moved, or the address may be incorrect.</p>
    <RouterLink class="primary-button home-link" to="/">Return home</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  max-width: 680px;
  margin: 5rem auto;
  padding: 3rem;
  text-align: center;
}

.status-code {
  display: block;
  color: var(--brand-100);
  font-size: clamp(5rem, 16vw, 10rem);
  font-weight: 900;
  line-height: 0.9;
}

.home-link {
  display: inline-flex;
  margin-top: 1rem;
  text-decoration: none;
}
</style>
