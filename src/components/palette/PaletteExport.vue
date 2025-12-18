<template>
  <div class="palette-export">
    <h3>📤 Экспорт палитры</h3>
    
    <div class="export-format-selector">
      <button
        v-for="format in exportFormats"
        :key="format.id"
        @click="selectedFormat = format.id"
        :class="['format-btn', { active: selectedFormat === format.id }]"
      >
        {{ format.name }}
      </button>
    </div>

    <div class="export-preview">
      <div class="preview-header">
        <h4>Предпросмотр кода:</h4>
        <button @click="copyCode" class="copy-code-btn">
          📋 Копировать код
        </button>
      </div>
      <pre class="code-block"><code>{{ exportCode }}</code></pre>
    </div>

    <div class="export-actions">
      <button @click="downloadFile" class="download-btn">
        💾 Скачать файл
      </button>
      <button @click="generateShareLink" class="share-btn">
        🔗 Создать ссылку для шаринга
      </button>
    </div>

    <div v-if="shareLink" class="share-link-section">
      <p>Ссылка для шаринга:</p>
      <div class="share-link-container">
        <input 
          type="text" 
          :value="shareLink" 
          readonly 
          class="share-link-input"
          ref="shareLinkInput"
        />
        <button @click="copyShareLink" class="copy-link-btn">
          Копировать
        </button>
      </div>
    </div>

    <Transition name="notification">
      <div v-if="showNotification" class="export-notification">
        {{ notificationMessage }}
      </div>
    </Transition>
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
  },
  paletteName: {
    type: String,
    default: 'My Palette'
  }
})

const selectedFormat = ref('css')
const shareLink = ref('')
const showNotification = ref(false)
const notificationMessage = ref('')
const shareLinkInput = ref(null)

const exportFormats = [
  { id: 'css', name: 'CSS Variables' },
  { id: 'scss', name: 'SCSS Variables' },
  { id: 'tailwind', name: 'Tailwind Config' },
  { id: 'json', name: 'JSON' }
]

const exportCode = computed(() => {
  switch (selectedFormat.value) {
    case 'css':
      return generateCSSVariables()
    case 'scss':
      return generateSCSSVariables()
    case 'tailwind':
      return generateTailwindConfig()
    case 'json':
      return generateJSON()
    default:
      return ''
  }
})

const generateCSSVariables = () => {
  let code = ':root {\n'
  props.colors.forEach((color, index) => {
    code += `  --color-${index + 1}: ${color};\n`
  })
  code += '}\n\n'
  code += '/* Использование */\n'
  code += '.example {\n'
  code += '  background-color: var(--color-1);\n'
  code += '  color: var(--color-2);\n'
  code += '}'
  return code
}

const generateSCSSVariables = () => {
  let code = '$palette: (\n'
  props.colors.forEach((color, index) => {
    code += `  'color-${index + 1}': ${color}${index < props.colors.length - 1 ? ',' : ''}\n`
  })
  code += ');\n\n'
  code += '// Использование\n'
  code += '.example {\n'
  code += "  background-color: map-get($palette, 'color-1');\n"
  code += "  color: map-get($palette, 'color-2');\n"
  code += '}'
  return code
}

const generateTailwindConfig = () => {
  let code = '// tailwind.config.js\n'
  code += 'module.exports = {\n'
  code += '  theme: {\n'
  code += '    extend: {\n'
  code += '      colors: {\n'
  code += "        palette: {\n"
  props.colors.forEach((color, index) => {
    code += `          ${index + 1}: '${color}'${index < props.colors.length - 1 ? ',' : ''}\n`
  })
  code += "        }\n"
  code += '      }\n'
  code += '    }\n'
  code += '  }\n'
  code += '}\n\n'
  code += '// Использование: bg-palette-1, text-palette-2 и т.д.'
  return code
}

const generateJSON = () => {
  const palette = {
    name: props.paletteName,
    colors: props.colors.map((color, index) => ({
      id: index + 1,
      hex: color,
      rgb: hexToRgb(color)
    }))
  }
  return JSON.stringify(palette, null, 2)
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(exportCode.value)
    showNotificationMessage('Код скопирован в буфер обмена!')
  } catch (err) {
    console.error('Ошибка копирования:', err)
    showNotificationMessage('Ошибка при копировании')
  }
}

const downloadFile = () => {
  const extension = selectedFormat.value === 'json' ? 'json' : 
                   selectedFormat.value === 'scss' ? 'scss' : 'css'
  const filename = `${props.paletteName.toLowerCase().replace(/\s+/g, '-')}.${extension}`
  
  const blob = new Blob([exportCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  showNotificationMessage(`Файл ${filename} скачан!`)
}

const generateShareLink = () => {
  const colorsParam = props.colors.join(',')
  const baseUrl = window.location.origin
  shareLink.value = `${baseUrl}/?palette=${encodeURIComponent(colorsParam)}&name=${encodeURIComponent(props.paletteName)}`
  showNotificationMessage('Ссылка создана!')
}

const copyShareLink = async () => {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
    try {
      await navigator.clipboard.writeText(shareLink.value)
      showNotificationMessage('Ссылка скопирована!')
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }
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
.palette-export {
  margin: 2rem 0;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.palette-export h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.export-format-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.format-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  color: #667eea;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.format-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.export-preview {
  margin-bottom: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.preview-header h4 {
  color: #2c3e50;
  margin: 0;
}

.copy-code-btn {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-code-btn:hover {
  background: #35a372;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.code-block code {
  color: inherit;
}

.export-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.download-btn,
.share-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: #667eea;
  color: white;
}

.download-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.share-btn {
  background: #42b883;
  color: white;
}

.share-btn:hover {
  background: #35a372;
  transform: translateY(-2px);
}

.share-link-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}

.share-link-section p {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.share-link-container {
  display: flex;
  gap: 0.5rem;
}

.share-link-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
}

.copy-link-btn {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-link-btn:hover {
  background: #35a372;
}

.export-notification {
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
</style>


