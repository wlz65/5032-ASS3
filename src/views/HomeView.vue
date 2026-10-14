<script setup>
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Climate knowledge, made practical</p>
      <h1>Learn locally. Act confidently.</h1>
      <p class="lede">
        MClimateWise Mel connects Melbourne learners, teachers and communities with clear climate
        resources and positive local action.
      </p>
      <div class="hero-actions">
        <RouterLink v-if="user" class="primary-button action-link" to="/tables">
          Explore climate data
        </RouterLink>
        <RouterLink v-else class="primary-button action-link" to="/login">Get started</RouterLink>
        <a class="secondary-button action-link" href="#what-we-offer">What we offer</a>
      </div>
    </div>
    <div class="hero-panel card" aria-label="MClimateWise Mel highlights">
      <div class="climate-orb" aria-hidden="true">
        <i class="pi pi-globe"></i>
      </div>
      <p>Melbourne-focused learning</p>
      <strong>Accessible resources and community events in one trusted place.</strong>
    </div>
  </section>

  <section id="what-we-offer" class="feature-section" aria-labelledby="offer-heading">
    <div class="page-heading">
      <p class="eyebrow">What we offer</p>
      <h2 id="offer-heading">Simple tools for climate learning</h2>
    </div>
    <div class="feature-grid">
      <article class="feature-card card">
        <i class="pi pi-book" aria-hidden="true"></i>
        <h3>Trusted resources</h3>
        <p>Search practical climate material by topic, audience, format and difficulty.</p>
      </article>
      <article class="feature-card card">
        <i class="pi pi-calendar" aria-hidden="true"></i>
        <h3>Local opportunities</h3>
        <p>Find workshops, talks and community activities across Melbourne.</p>
      </article>
      <article class="feature-card card">
        <i class="pi pi-envelope" aria-hidden="true"></i>
        <h3>Useful sharing</h3>
        <p>Send selected learning material as an email with a supporting attachment.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 560px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
}

.hero-copy {
  max-width: 720px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.7rem;
}

.action-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  color: #fff;
  background: linear-gradient(150deg, #0b5d53, #158663 65%, #63a94f);
}

.hero-panel::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  right: -55px;
  bottom: -75px;
  border: 28px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
}

.hero-panel p {
  margin: 1.5rem 0 0.45rem;
  opacity: 0.8;
  font-weight: 700;
}

.hero-panel strong {
  position: relative;
  z-index: 1;
  display: block;
  font-size: 1.5rem;
  line-height: 1.25;
}

.climate-orb {
  width: 92px;
  height: 92px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--brand-950);
  background: #ddf4a9;
  font-size: 2.4rem;
  box-shadow: 0 0 0 18px rgba(255, 255, 255, 0.1);
}

.feature-section {
  padding: 3rem 0 1rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}

.feature-card {
  padding: 1.5rem;
}

.feature-card i {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 1.2rem;
  border-radius: 12px;
  color: var(--brand-800);
  background: var(--brand-100);
  font-size: 1.2rem;
}

.feature-card p {
  margin-bottom: 0;
  color: var(--ink-700);
}

@media (max-width: 760px) {
  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    padding: 2rem 0;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
