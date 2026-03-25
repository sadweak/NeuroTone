<template>
  <div class="app-container">
    <div class="main-content">
      <header class="title-section">
        <p class="eyebrow">Parkinson’s Early-Screening Companion</p>
        <h1>NEUROTONE</h1>
        <p class="today">{{ todayLabel }}</p>
      </header>

      <section class="carousel-shell">
        <Carousel v-bind="config">
          <Slide
            v-for="image in images"
            :key="image.id"
            class="slide"
            @click="goToTest(image.route, image.id)"
          >
            <div
              class="autoscroll-container"
              :style="`background-image: url(${image.url});`"
            >
              <div class="slide-chip">Tap to open</div>
            </div>
          </Slide>
        </Carousel>
      </section>

      <section class="all-tests-section">
        <div class="section-header">
          <h2>All Assessments</h2>
          <small>Select a module to continue</small>
        </div>

        <div class="test-boxes">
          <button
            class="test-box"
            :class="{ active: selectedTest === 'voice' }"
            @click="goToTest('/voice', 3, 'voice')"
          >
            <img src="../assets/voice.png" class="art" alt="Voice" />
            <h4 class="art-text">Voice Analysis</h4>
          </button>

          <button
            class="test-box"
            :class="{ active: selectedTest === 'write' }"
            @click="goToTest('/write', 2, 'write')"
          >
            <img src="../assets/posture.png" class="art" alt="Scribble" />
            <h4 class="art-text">Scribble Test</h4>
          </button>

          <button
            class="test-box"
            :class="{ active: selectedTest === 'tremor' }"
            @click="goToTest('/tremor', 1, 'tremor')"
          >
            <img src="../assets/hand.png" class="art" alt="Tremor" />
            <h4 class="art-text">Tremor Detection</h4>
          </button>
        </div>
      </section>

      <section class="recent-analysis-section">
        <h2>Recent Analysis</h2>

        <div class="report-card">
          <div class="report-date">{{ todayLabel }}</div>
          <div class="report-title">Generate the latest summary report</div>

          <button class="download-button" :disabled="isDownloading" @click="getRecentReport">
            {{ isDownloading ? 'Preparing report...' : 'Download Report' }}
            <span class="down-arrow">↓</span>
          </button>

          <div class="mail-row">
            <input
              v-model="email"
              class="mail-input"
              type="email"
              placeholder="name@email.com"
              aria-label="Email"
            />
            <button class="mail-button" @click="mailReport">Mail</button>
          </div>

          <p class="status" :class="statusType" v-if="statusMessage">{{ statusMessage }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide } from 'vue3-carousel';

import cardImage1 from '../assets/banner.png';
import cardImage2 from '../assets/banner2.png';
import cardImage3 from '../assets/banner3.png';
import { API_ENDPOINTS } from '../config/api';

const router = useRouter();
const selectedTest = ref('voice');
const email = ref('');
const isDownloading = ref(false);
const statusMessage = ref('');
const statusType = ref('info');

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
);

const images = [
  { id: 1, url: cardImage2, route: '/tremor' },
  { id: 2, url: cardImage3, route: '/write' },
  { id: 3, url: cardImage1, route: '/voice' },
];

function goToTest(route, id, testName = '') {
  if (testName) {
    selectedTest.value = testName;
  }
  router.push(route);
}

async function getRecentReport() {
  if (isDownloading.value) return;

  isDownloading.value = true;
  statusMessage.value = '';

  try {
    const response = await fetch(API_ENDPOINTS.report, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Report request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `neurotone-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    statusType.value = 'success';
    statusMessage.value = 'Report downloaded successfully.';
  } catch (error) {
    statusType.value = 'error';
    statusMessage.value = error.message || 'Unable to download the report.';
  } finally {
    isDownloading.value = false;
  }
}

function mailReport() {
  if (!email.value || !email.value.includes('@')) {
    statusType.value = 'error';
    statusMessage.value = 'Add a valid email address to continue.';
    return;
  }

  const subject = encodeURIComponent('Neurotone Recent Analysis Report');
  const body = encodeURIComponent(
    `Please attach the latest Neurotone report for ${todayLabel.value}.`
  );

  window.location.href = `mailto:${email.value}?subject=${subject}&body=${body}`;
  statusType.value = 'success';
  statusMessage.value = 'Opened your mail app with a pre-filled request.';
}

const config = {
  height: 220,
  itemsToShow: 1,
  gap: 12,
  autoplay: 3200,
  wrapAround: true,
  pauseAutoplayOnHover: true,
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  margin: 0 auto;
  font-family: Poppins, sans-serif;
  background: radial-gradient(circle at top, #fff2f8 0%, #fffafc 58%, #f6f5ff 100%);
}

.main-content {
  flex: 1;
  padding-bottom: 2rem;
  overflow-y: auto;
}

.title-section {
  margin-bottom: 1rem;
  padding: 2.2rem 1.2rem 1.2rem;
  text-align: center;
}

.eyebrow {
  color: #8f6c7e;
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
  letter-spacing: 0.03rem;
}

h1 {
  color: #eb4899;
  font-weight: 800;
  font-size: 1.7rem;
}

.today {
  color: #5f4b56;
  margin-top: 0.6rem;
  font-size: 0.85rem;
}

.carousel-shell {
  margin-bottom: 1.4rem;
}

.slide {
  padding: 0 1rem;
}

.autoscroll-container {
  height: 13.8rem;
  width: 100%;
  border-radius: 1rem;
  background-size: cover;
  background-position: center;
  box-shadow: 0 8px 24px rgba(92, 66, 49, 0.25);
  position: relative;
}

.slide-chip {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  background: rgba(255, 255, 255, 0.88);
  color: #5c4231;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
}

.all-tests-section,
.recent-analysis-section {
  padding: 0 1.2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.8rem;
}

h2 {
  color: #5c4231;
  font-size: 1.1rem;
  font-weight: 800;
}

small {
  color: #8a6d5b;
  font-size: 0.74rem;
}

.test-boxes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.test-box {
  border: none;
  min-height: 9.5rem;
  border-radius: 0.9rem;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem 0.7rem;
  box-shadow: 0 10px 20px rgba(84, 54, 92, 0.08);
}

.art {
  height: 2.6rem;
  width: auto;
}

.art-text {
  font-size: 0.8rem;
  line-height: 1rem;
  font-weight: 600;
  color: #5c4231;
  text-align: center;
}

.active {
  background: linear-gradient(180deg, #ffeaf4 0%, #ffe5c8 100%);
  outline: 1px solid #f4bdd8;
}

.report-card {
  background: linear-gradient(140deg, #3d2200 0%, #553014 100%);
  padding: 1.35rem 1.2rem;
  border-radius: 1rem;
  color: #f5ddbc;
  text-align: center;
  box-shadow: 0 14px 28px rgba(61, 34, 0, 0.25);
}

.report-date {
  font-size: 0.8rem;
  margin-bottom: 0.45rem;
  opacity: 0.8;
}

.report-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.95rem;
}

.download-button {
  background-color: #eed1a7;
  color: #4d2f19;
  border: none;
  width: 100%;
  padding: 0.78rem 1rem;
  border-radius: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.download-button:disabled {
  opacity: 0.65;
}

.down-arrow {
  margin-left: 0.45rem;
}

.mail-row {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.mail-input {
  border: 1px solid rgba(255, 232, 204, 0.5);
  border-radius: 0.65rem;
  padding: 0.55rem 0.7rem;
  background: rgba(255, 255, 255, 0.12);
  color: #fff4de;
}

.mail-input::placeholder {
  color: rgba(255, 241, 222, 0.7);
}

.mail-button {
  border: 1px solid rgba(255, 231, 204, 0.6);
  background: transparent;
  color: #f6e0c1;
  border-radius: 0.65rem;
  padding: 0.55rem 0.9rem;
  font-weight: 600;
}

.status {
  margin-top: 0.65rem;
  font-size: 0.77rem;
  line-height: 1.2;
}

.success {
  color: #a9ffc2;
}

.error {
  color: #ffc6c6;
}
</style>
