<template>
    <div class="custom-audio-player">
      <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <audio ref="audio" :src="src" @timeupdate="updateTime" @ended="handleEnded"></audio>
      <div>{{ currentTime | formatTime }} / {{ duration | formatTime }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    src: {
      type: String,
      required: true
    }
  });
  
  const audio = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  
  const togglePlay = () => {
    if (!audio.value) return;
  
    if (isPlaying.value) {
      audio.value.pause();
    } else {
      audio.value.play();
    }
    isPlaying.value = !isPlaying.value;
  };
  
  const updateTime = () => {
    if (!audio.value) return;
  
    currentTime.value = audio.value.currentTime;
    duration.value = audio.value.duration;
  };
  
  const handleEnded = () => {
    isPlaying.value = false;
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  </script>
  
  <style scoped>
  .custom-audio-player {
    display: flex;
    align-items: center;
  }
  
  .custom-audio-player button {
    margin-right: 10px;
  }
  </style>