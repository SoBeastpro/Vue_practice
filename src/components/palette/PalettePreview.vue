<template>
  <div class="palette-preview">
    <div class="preview-controls">
      <button 
        @click="toggleBackground" 
        class="bg-toggle-btn"
        :class="{ active: isDarkBackground }"
      >
        {{ isDarkBackground ? '🌙' : '☀️' }} 
        {{ isDarkBackground ? 'Темный фон' : 'Светлый фон' }}
      </button>
    </div>
    
    <div 
      class="preview-container" 
      :class="{ 'dark-bg': isDarkBackground }"
    >
      <!-- Mockup интерфейса -->
      <div class="mockup-interface">
        <div class="mockup-header" :style="{ backgroundColor: colors[0] || '#667eea' }">
          <h2 class="mockup-title" :style="{ color: getContrastColor(colors[0] || '#667eea') }">
            Заголовок страницы
          </h2>
        </div>
        
        <div class="mockup-content">
          <div 
            class="mockup-card" 
            :style="{ 
              backgroundColor: colors[1] || '#f0f0f0',
              color: getContrastColor(colors[1] || '#f0f0f0')
            }"
          >
            <h3>Карточка контента</h3>
            <p>Это пример карточки с использованием цветов из палитры.</p>
          </div>
          
          <div class="mockup-buttons">
            <button 
              class="mockup-button primary"
              :style="{ 
                backgroundColor: colors[2] || '#42b883',
                color: getContrastColor(colors[2] || '#42b883')
              }"
            >
              Основная кнопка
            </button>
            <button 
              class="mockup-button secondary"
              :style="{ 
                backgroundColor: colors[3] || '#764ba2',
                color: getContrastColor(colors[3] || '#764ba2')
              }"
            >
              Вторичная кнопка
            </button>
          </div>
          
          <div 
            class="mockup-accent"
            :style="{ backgroundColor: colors[4] || '#ff6b6b' }"
          >
            <span :style="{ color: getContrastColor(colors[4] || '#ff6b6b') }">
              Акцентный элемент
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { hexToRgb } from '../../utils/colorUtils'

const props = defineProps({
  colors: {
    type: Array,
    required: true,
    default: () => []
  }
})

const isDarkBackground = ref(false)

const toggleBackground = () => {
  isDarkBackground.value = !isDarkBackground.value
}

const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000'
  
  // Вычисляем яркость
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000' : '#fff'
}
</script>

<style scoped>
.palette-preview {
  margin: 2rem 0;
}

.preview-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.bg-toggle-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.bg-toggle-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.bg-toggle-btn.active {
  background: #2c3e50;
  border-color: #2c3e50;
  color: white;
}

.preview-container {
  border-radius: 16px;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;
}

.preview-container.dark-bg {
  background: #1a1a1a;
}

.mockup-interface {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mockup-header {
  padding: 2rem;
  text-align: center;
  transition: background 0.3s ease;
}

.mockup-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.mockup-content {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.preview-container.dark-bg .mockup-content {
  background: rgba(0, 0, 0, 0.3);
}

.mockup-card {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.mockup-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.mockup-card p {
  margin: 0;
  opacity: 0.9;
}

.mockup-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.mockup-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mockup-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mockup-accent {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  transition: background 0.3s ease;
}
</style>


