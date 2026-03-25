<template>
  <div class="writing-test-container">
    <div class="title-box">
      <h1 class="title">SCRIBBLE ANALYSIS</h1>
      <p class="subtitle">Upload your drawing and get an instant prediction</p>
    </div>

    <div class="content-wrap">
      <div class="upload-options">
        <button class="upload-option" @click="takePhoto">
          <img src="../assets/camera.png" alt="Camera Icon" class="camera-icon" />
          <span>Take Photo</span>
        </button>

        <div class="divider"></div>

        <button class="upload-option" @click="chooseFromGallery">
          <img src="../assets/photos.png" alt="Photos Icon" class="photos-icon" />
          <span>Choose From Gallery</span>
        </button>
      </div>

      <div class="upload-header">
        <button class="back-button" @click="$router.push('/home')">
          <span class="arrow">&larr;</span>
        </button>
        <h2 class="upload-title">Upload Photo</h2>
      </div>

      <div class="instructions">
        <p class="instruction-detail">
          <span class="strong">Draw the shown scribble</span> in one continuous stroke.
          Use plain paper + ball-point pen for best clarity.
        </p>
      </div>

      <div class="flex-wrapper">
        <div class="reference-pane">
          <img src="../assets/scribble.png" alt="Reference image" class="reference-image" />
        </div>

        <div class="vertical-divider"></div>

        <div class="image-preview" :class="{ 'has-image': hasImage }">
          <img v-if="imagePreview" :src="imagePreview" alt="Uploaded image" />
          <div v-else class="not-found">
            <img src="../assets/notfound.png" alt="Image Not Found" class="not-found-img" />
            <h5>Upload an image to get started</h5>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        capture="environment"
        class="hidden-file"
        @change="handleFileChange"
      />

      <div class="action-row">
        <button
          class="submit-btn"
          :class="{ disabled: !hasImage, loading: isLoading }"
          :disabled="!hasImage || isLoading"
          @click="uploadImage"
        >
          {{ isLoading ? 'Analysing...' : 'Analyse Scribble' }}
        </button>

        <button class="reset-btn" :disabled="!hasImage || isLoading" @click="resetSelection">
          Reset
        </button>
      </div>

      <div class="result" :class="resultVariant">
        <template v-if="apiResponse">
          <p class="result-label">Prediction: <strong>{{ resultLabel }}</strong></p>
          <p class="result-score" v-if="resultConfidence !== null">
            Confidence: {{ resultConfidence }}%
          </p>
          <p class="result-raw" v-if="apiResponseText">{{ apiResponseText }}</p>
        </template>

        <p v-else>
          Result will appear here after upload.
        </p>
      </div>

      <p class="inline-error" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { API_ENDPOINTS } from '../config/api';

const MAX_IMAGE_SIZE_MB = 8;

const fileInput = ref(null);
const imagePreview = ref('');
const hasImage = ref(false);
const isLoading = ref(false);
const apiResponse = ref(null);
const errorMessage = ref('');

const resultLabel = computed(() => {
  if (!apiResponse.value) return '';
  return (
    apiResponse.value.prediction ||
    apiResponse.value.label ||
    apiResponse.value.result ||
    'Prediction received'
  );
});

const resultConfidence = computed(() => {
  const score = apiResponse.value?.confidence ?? apiResponse.value?.probability;
  if (typeof score !== 'number') return null;
  return Math.round(score <= 1 ? score * 100 : score);
});

const resultVariant = computed(() => {
  if (!apiResponse.value) return 'neutral';
  if (apiResponse.value.error) return 'error';
  return 'success';
});

const apiResponseText = computed(() => {
  if (!apiResponse.value) return '';
  return apiResponse.value.message || apiResponse.value.details || '';
});

const takePhoto = () => fileInput.value?.click();
const chooseFromGallery = () => fileInput.value?.click();

function resetSelection() {
  imagePreview.value = '';
  hasImage.value = false;
  apiResponse.value = null;
  errorMessage.value = '';

  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

const handleFileChange = (event) => {
  errorMessage.value = '';

  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select a valid image file.';
    resetSelection();
    return;
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
    errorMessage.value = `Please upload an image under ${MAX_IMAGE_SIZE_MB}MB.`;
    resetSelection();
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    hasImage.value = true;
    apiResponse.value = null;
  };
  reader.readAsDataURL(file);
};

const uploadImage = async () => {
  if (!hasImage.value || isLoading.value) return;

  const file = fileInput.value?.files?.[0];
  if (!file) {
    errorMessage.value = 'No file selected.';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.scribbleAnalyze, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    apiResponse.value = data;
  } catch (error) {
    apiResponse.value = { error: true, message: error.message };
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.writing-test-container {
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  font-family: Poppins, sans-serif;
  color: #6d4c41;
  background: linear-gradient(180deg, #fff3f8 0%, #ffffff 35%);
}

.content-wrap {
  padding: 0 1.2rem 1.5rem;
}

.title-box {
  background-color: #ffeef5;
  padding: 2.2rem 1rem 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.title {
  color: #e91e63;
  font-size: 1.45rem;
  font-weight: 800;
}

.subtitle {
  margin-top: 0.45rem;
  color: #8f6f7f;
  font-size: 0.8rem;
}

.upload-options {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 0.8rem;
  border: #d6b9c5 1px solid;
  box-shadow: 0 8px 18px rgba(97, 62, 81, 0.08);
  margin-bottom: 1.1rem;
}

.upload-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.93rem;
  color: #6d4c41;
  font-weight: 600;
}

.camera-icon,
.photos-icon {
  height: 1.1rem;
}

.divider {
  height: 1px;
  background-color: #f2e6ec;
  width: 90%;
  margin: 0 auto;
}

.upload-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.55rem;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.35rem;
  color: #6d4c41;
  padding: 0;
  margin-right: 0.4rem;
}

.upload-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.instructions {
  margin-bottom: 0.8rem;
}

.instruction-detail {
  color: #6d4c41;
  font-size: 0.82rem;
  line-height: 1.4rem;
}

.strong {
  font-weight: 700;
}

.flex-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dec4cf;
  border-radius: 0.8rem;
  min-height: 13.2rem;
  padding: 0.8rem;
  background: #fff;
}

.reference-pane,
.image-preview {
  width: calc(50% - 0.4rem);
}

.reference-pane {
  display: flex;
  align-items: center;
  justify-content: center;
}

.reference-image {
  max-height: 9rem;
  width: auto;
}

.vertical-divider {
  height: 10.5rem;
  width: 1px;
  background-color: #eadbe2;
}

.image-preview {
  height: 10.5rem;
  background-color: #f8f3f5;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview.has-image {
  background-color: #ffffff;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.5rem;
}

.not-found-img {
  height: 2rem;
  margin-bottom: 0.35rem;
}

.not-found h5 {
  font-size: 0.7rem;
  line-height: 1rem;
}

.hidden-file {
  display: none;
}

.action-row {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.submit-btn,
.reset-btn {
  border-radius: 0.6rem;
  padding: 0.8rem 1rem;
  font-weight: 600;
  text-align: center;
  border: none;
}

.submit-btn {
  flex: 1;
  background-color: #6d4c41;
  color: #fff;
}

.submit-btn.disabled,
.submit-btn.loading,
.reset-btn:disabled {
  background-color: #a89a93;
  cursor: not-allowed;
}

.reset-btn {
  width: 5.5rem;
  background: #f2e4ea;
  color: #6d4c41;
}

.result {
  border: 1px solid #d9c7cf;
  padding: 0.85rem;
  width: 100%;
  border-radius: 0.8rem;
  min-height: 5rem;
  margin-top: 0.7rem;
  background: #fff;
  font-size: 0.84rem;
  line-height: 1.35;
}

.result.success {
  border-color: #a6dfba;
  background: #f4fff8;
}

.result.error {
  border-color: #e8aaaa;
  background: #fff6f6;
}

.result-label {
  margin-bottom: 0.3rem;
}

.result-score {
  margin-bottom: 0.3rem;
}

.inline-error {
  margin-top: 0.45rem;
  color: #b94c4c;
  font-size: 0.75rem;
}
</style>
