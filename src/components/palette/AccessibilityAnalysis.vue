<template>
  <div class="accessibility-analysis">
    <h3>🔍 Анализ доступности (WCAG)</h3>
    
    <div class="color-inputs">
      <div class="input-group">
        <label>Цвет текста:</label>
        <div class="color-input-wrapper">
          <input 
            type="color" 
            v-model="textColor" 
            class="color-picker"
          />
          <input 
            type="text" 
            v-model="textColor" 
            class="color-text-input"
            placeholder="#000000"
            @input="validateColor('textColor')"
          />
        </div>
      </div>

      <div class="input-group">
        <label>Цвет фона:</label>
        <div class="color-input-wrapper">
          <input 
            type="color" 
            v-model="backgroundColor" 
            class="color-picker"
          />
          <input 
            type="text" 
            v-model="backgroundColor" 
            class="color-text-input"
            placeholder="#ffffff"
            @input="validateColor('backgroundColor')"
          />
        </div>
      </div>
    </div>

    <div v-if="textColor && backgroundColor" class="analysis-result">
      <!-- Превью контраста -->
      <div class="contrast-preview-section">
        <h4>Превью контраста</h4>
        <div class="preview-examples">
          <div class="preview-example">
            <div 
              class="preview-box"
              :style="{ 
                backgroundColor: backgroundColor,
                color: textColor
              }"
            >
              <p class="preview-text-normal">
                Обычный текст (16px)
              </p>
              <p class="preview-text-large">
                Крупный текст (18px+ или жирный)
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Результаты анализа -->
      <div class="analysis-details">
        <h4>Результаты анализа WCAG</h4>
        
        <div class="contrast-info-card">
          <div class="contrast-ratio-display">
            <span class="ratio-label">Коэффициент контрастности:</span>
            <span class="ratio-value">{{ contrastInfo.ratio }}:1</span>
          </div>

          <div class="wcag-results">
            <div class="wcag-item">
              <div class="wcag-header">
                <span class="wcag-title">Обычный текст (AA)</span>
                <span 
                  :class="['wcag-status', contrastInfo.AA ? 'pass' : 'fail']"
                >
                  {{ contrastInfo.AA ? '✓ Проходит' : '✗ Не проходит' }}
                </span>
              </div>
              <p class="wcag-description">
                Минимальный коэффициент: 4.5:1
              </p>
            </div>

            <div class="wcag-item">
              <div class="wcag-header">
                <span class="wcag-title">Крупный текст (AA Large)</span>
                <span 
                  :class="['wcag-status', contrastInfo.AALarge ? 'pass' : 'fail']"
                >
                  {{ contrastInfo.AALarge ? '✓ Проходит' : '✗ Не проходит' }}
                </span>
              </div>
              <p class="wcag-description">
                Минимальный коэффициент: 3:1
              </p>
            </div>

            <div class="wcag-item">
              <div class="wcag-header">
                <span class="wcag-title">Обычный текст (AAA)</span>
                <span 
                  :class="['wcag-status', contrastInfo.AAA ? 'pass' : 'fail']"
                >
                  {{ contrastInfo.AAA ? '✓ Проходит' : '✗ Не проходит' }}
                </span>
              </div>
              <p class="wcag-description">
                Минимальный коэффициент: 7:1
              </p>
            </div>

            <div class="wcag-item">
              <div class="wcag-header">
                <span class="wcag-title">Крупный текст (AAA Large)</span>
                <span 
                  :class="['wcag-status', contrastInfo.AAALarge ? 'pass' : 'fail']"
                >
                  {{ contrastInfo.AAALarge ? '✓ Проходит' : '✗ Не проходит' }}
                </span>
              </div>
              <p class="wcag-description">
                Минимальный коэффициент: 4.5:1
              </p>
            </div>
          </div>
        </div>

        <!-- Рекомендации -->
        <div class="recommendations" v-if="!contrastInfo.AA">
          <h5>💡 Рекомендации для улучшения контраста:</h5>
          <ul>
            <li v-if="contrastInfo.ratio < 3">
              Контраст очень низкий. Рекомендуется значительно изменить один из цветов.
            </li>
            <li v-else-if="contrastInfo.ratio < 4.5">
              Контраст недостаточен для обычного текста. Попробуйте сделать текст темнее или фон светлее.
            </li>
            <li v-else>
              Контраст достаточен для крупного текста, но не для обычного. Рассмотрите возможность увеличения размера шрифта или улучшения контраста.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Введите два цвета для анализа контрастности</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { checkWCAG, hexToRgb } from '../../utils/colorUtils'

const textColor = ref('#000000')
const backgroundColor = ref('#ffffff')

const contrastInfo = computed(() => {
  if (!textColor.value || !backgroundColor.value) {
    return {
      ratio: 0,
      AA: false,
      AALarge: false,
      AAA: false,
      AAALarge: false
    }
  }
  return checkWCAG(textColor.value, backgroundColor.value)
})

const validateColor = (field) => {
  const color = field === 'textColor' ? textColor.value : backgroundColor.value
  // Проверяем формат HEX
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    // Если не валидный HEX, пытаемся исправить
    if (color.startsWith('#')) {
      const hex = color.slice(1).replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).padEnd(6, '0')
      if (field === 'textColor') {
        textColor.value = '#' + hex.toUpperCase()
      } else {
        backgroundColor.value = '#' + hex.toUpperCase()
      }
    } else if (color.length > 0) {
      // Добавляем # если его нет
      const hex = color.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).padEnd(6, '0')
      if (field === 'textColor') {
        textColor.value = '#' + hex.toUpperCase()
      } else {
        backgroundColor.value = '#' + hex.toUpperCase()
      }
    }
  }
}
</script>

<style scoped>
.accessibility-analysis {
  margin: 2rem 0;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.accessibility-analysis h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 60px;
  height: 50px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-text-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s;
}

.color-text-input:focus {
  outline: none;
  border-color: #667eea;
}

.analysis-result {
  margin-top: 2rem;
}

.contrast-preview-section {
  margin-bottom: 2rem;
}

.contrast-preview-section h4,
.analysis-details h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.preview-examples {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview-example {
  flex: 1;
  min-width: 300px;
}

.preview-box {
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.preview-text-normal {
  font-size: 16px;
  font-weight: 400;
  margin: 0;
}

.preview-text-large {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.analysis-details {
  margin-top: 2rem;
}

.contrast-info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.contrast-ratio-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.ratio-label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.ratio-value {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.wcag-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wcag-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.wcag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wcag-title {
  font-weight: 600;
  color: #333;
}

.wcag-status {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
}

.wcag-status.pass {
  background: #42b883;
  color: white;
}

.wcag-status.fail {
  background: #ff6b6b;
  color: white;
}

.wcag-description {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.recommendations {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.recommendations h5 {
  margin: 0 0 1rem 0;
  color: #856404;
}

.recommendations ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #856404;
}

.recommendations li {
  margin-bottom: 0.5rem;
}

.recommendations li:last-child {
  margin-bottom: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .color-inputs {
    grid-template-columns: 1fr;
  }

  .preview-example {
    min-width: 100%;
  }

  .contrast-ratio-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
