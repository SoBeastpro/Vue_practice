<template>
  <div class="palette-generator">
    <header class="generator-header">
      <h1>🎨 Генератор цветовых палитр</h1>
      <p>Создавайте гармоничные цветовые схемы для ваших проектов</p>
    </header>

    <div class="generator-controls">
      <div class="control-group">
        <label>Количество цветов:</label>
        <select v-model="colorCount" class="control-input">
          <option :value="3">3</option>
          <option :value="5">5</option>
          <option :value="7">7</option>
        </select>
      </div>

      <div class="control-group">
        <label>Формат отображения:</label>
        <select v-model="colorFormat" class="control-input">
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
        </select>
      </div>

      <button @click="generateRandomPalette" class="generate-btn">
        🎲 Случайная палитра
      </button>
      
      <button 
        v-if="currentPalette.length > 0"
        @click="showSaveModal = true" 
        class="save-palette-btn"
      >
        💾 Сохранить палитру
      </button>
    </div>

    <!-- Продвинутые настройки (Практика 28) -->
    <div class="advanced-controls" v-if="showAdvanced">
      <h3>Продвинутая генерация</h3>
      
      <div class="control-group">
        <label>Базовый цвет:</label>
        <input 
          type="color" 
          v-model="baseColor" 
          class="color-picker"
        />
        <span class="color-value">{{ baseColor }}</span>
      </div>

      <div class="control-group">
        <label>Тип палитры:</label>
        <select v-model="paletteType" class="control-input">
          <option value="random">Случайная</option>
          <option value="analogous">Аналогичная</option>
          <option value="monochromatic">Монохромная</option>
          <option value="triad">Триада</option>
          <option value="complementary">Комплементарная</option>
        </select>
      </div>

      <div class="control-group">
        <label>Настроение:</label>
        <select v-model="mood" class="control-input">
          <option value="">Не выбрано</option>
          <option value="calm">Спокойное</option>
          <option value="energetic">Энергичное</option>
          <option value="professional">Профессиональное</option>
          <option value="nature">Природное</option>
          <option value="warm">Теплое</option>
          <option value="cool">Холодное</option>
        </select>
      </div>

      <button @click="generateAdvancedPalette" class="generate-btn">
        ✨ Сгенерировать палитру
      </button>
    </div>

    <button 
      @click="showAdvanced = !showAdvanced" 
      class="toggle-advanced-btn"
    >
      {{ showAdvanced ? '▼' : '▶' }} {{ showAdvanced ? 'Скрыть' : 'Показать' }} продвинутые настройки
    </button>

    <!-- Отображение палитры -->
    <PaletteDisplay 
      v-if="currentPalette.length > 0"
      :colors="currentPalette"
      :format="colorFormat"
      @color-copied="handleColorCopied"
    />

    <!-- Превью палитры -->
    <PalettePreview 
      v-if="currentPalette.length > 0"
      :colors="currentPalette"
    />

    <!-- Анализ доступности -->
    <AccessibilityAnalysis />

    <!-- Экспорт палитры -->
    <PaletteExport 
      v-if="currentPalette.length > 0"
      :colors="currentPalette"
      :palette-name="paletteName"
    />

    <!-- Модальное окно сохранения -->
    <Transition name="modal">
      <div v-if="showSaveModal" class="modal-overlay" @click="showSaveModal = false">
        <div class="modal-content" @click.stop>
          <h2>Сохранить палитру</h2>
          <div class="modal-form">
            <div class="form-group">
              <label>Название:</label>
              <input
                v-model="savePaletteName"
                type="text"
                placeholder="Название палитры"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Теги (через запятую):</label>
              <input
                v-model="savePaletteTags"
                type="text"
                placeholder="например: веб, дизайн, UI"
                class="form-input"
              />
            </div>
            <div class="form-actions">
              <button @click="savePaletteToLibrary" class="save-btn">
                💾 Сохранить
              </button>
              <button @click="showSaveModal = false" class="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Уведомление о копировании -->
    <Transition name="notification">
      <div v-if="showNotification" class="global-notification">
        {{ notificationMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { 
  randomColor, 
  generateHarmoniousPalette, 
  generateMoodPalette 
} from '../utils/colorUtils'
import PaletteDisplay from '../components/palette/PaletteDisplay.vue'
import PalettePreview from '../components/palette/PalettePreview.vue'
import AccessibilityAnalysis from '../components/palette/AccessibilityAnalysis.vue'
import PaletteExport from '../components/palette/PaletteExport.vue'

const colorCount = ref(5)
const colorFormat = ref('hex')
const currentPalette = ref([])
const showAdvanced = ref(false)
const baseColor = ref('#667eea')
const paletteType = ref('random')
const mood = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const paletteName = ref('Моя палитра')
const showSaveModal = ref(false)
const savePaletteName = ref('')
const savePaletteTags = ref('')

// Загружаем сохраненную палитру при монтировании
onMounted(() => {
  // Проверяем параметры URL для шаринга
  const urlParams = new URLSearchParams(window.location.search)
  const paletteParam = urlParams.get('palette')
  const nameParam = urlParams.get('name')
  
  if (paletteParam) {
    // Загружаем палитру из URL
    const colors = paletteParam.split(',').filter(c => c.startsWith('#'))
    if (colors.length > 0) {
      currentPalette.value = colors
      if (nameParam) {
        paletteName.value = decodeURIComponent(nameParam)
      }
    }
  } else {
    loadSavedPalette()
    if (currentPalette.value.length === 0) {
      generateRandomPalette()
    }
  }
})

// Сохраняем палитру в localStorage при изменении
watch(currentPalette, (newPalette) => {
  if (newPalette.length > 0) {
    localStorage.setItem('currentPalette', JSON.stringify(newPalette))
    localStorage.setItem('colorFormat', colorFormat.value)
    localStorage.setItem('colorCount', colorCount.value.toString())
  }
}, { deep: true })

// Загружаем сохраненную палитру
const loadSavedPalette = () => {
  const saved = localStorage.getItem('currentPalette')
  const savedFormat = localStorage.getItem('colorFormat')
  const savedCount = localStorage.getItem('colorCount')
  
  if (saved) {
    currentPalette.value = JSON.parse(saved)
  }
  if (savedFormat) {
    colorFormat.value = savedFormat
  }
  if (savedCount) {
    colorCount.value = parseInt(savedCount)
  }
}

// Генерирует случайную палитру
const generateRandomPalette = () => {
  const colors = []
  for (let i = 0; i < colorCount.value; i++) {
    colors.push(randomColor())
  }
  currentPalette.value = colors
}

// Генерирует продвинутую палитру
const generateAdvancedPalette = () => {
  if (mood.value) {
    currentPalette.value = generateMoodPalette(mood.value, colorCount.value)
  } else {
    currentPalette.value = generateHarmoniousPalette(
      baseColor.value, 
      colorCount.value, 
      paletteType.value
    )
  }
}

// Обработчик копирования цвета
const handleColorCopied = (color) => {
  notificationMessage.value = `Цвет ${color} скопирован в буфер обмена!`
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// Сохранение палитры в библиотеку
const savePaletteToLibrary = () => {
  if (!savePaletteName.value.trim()) {
    alert('Введите название палитры')
    return
  }

  const saved = localStorage.getItem('savedPalettes')
  const palettes = saved ? JSON.parse(saved) : []
  
  const tags = savePaletteTags.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)

  const newPalette = {
    id: Date.now().toString(),
    name: savePaletteName.value,
    colors: [...currentPalette.value],
    tags: tags,
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  palettes.push(newPalette)
  localStorage.setItem('savedPalettes', JSON.stringify(palettes))
  
  showSaveModal.value = false
  savePaletteName.value = ''
  savePaletteTags.value = ''
  paletteName.value = newPalette.name
  
  showNotificationMessage('Палитра сохранена в библиотеку!')
}

const showNotificationMessage = (message) => {
  notificationMessage.value = message
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}
</script>

<style scoped>
.palette-generator {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.generator-header {
  text-align: center;
  margin-bottom: 3rem;
}

.generator-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.generator-header p {
  font-size: 1.2rem;
  color: #666;
}

.generator-controls {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.control-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  cursor: pointer;
}

.control-input:focus {
  outline: none;
  border-color: #667eea;
}

.color-picker {
  width: 60px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.color-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
}

.generate-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.advanced-controls {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.advanced-controls h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.advanced-controls .control-group {
  margin-bottom: 1rem;
}

.advanced-controls .control-group:last-of-type {
  margin-bottom: 0;
}

.toggle-advanced-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 2px dashed #667eea;
  color: #667eea;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.toggle-advanced-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-style: solid;
}

.global-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #42b883;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
  z-index: 1000;
  font-weight: 500;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.save-palette-btn {
  padding: 0.75rem 2rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.save-palette-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.save-btn {
  flex: 1;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #5568d3;
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  color: #666;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  border-color: #999;
  background: #f0f0f0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .palette-generator {
    padding: 1rem;
  }

  .generator-header h1 {
    font-size: 2rem;
  }

  .generator-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    width: 100%;
  }
}
</style>

