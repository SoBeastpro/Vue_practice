<template>
  <div 
    class="color-card" 
    :style="{ backgroundColor: color }"
    :class="{ 'pinned': isPinned, 'dark-text': isDarkText }"
    @click="copyToClipboard"
  >
    <div class="color-info">
      <div class="color-value" v-if="format === 'hex'">{{ color }}</div>
      <div class="color-value" v-else-if="format === 'rgb'">{{ rgbValue }}</div>
      <div class="color-actions">
        <button 
          class="pin-btn" 
          @click.stop="togglePin"
          :title="isPinned ? 'Открепить' : 'Закрепить'"
        >
          {{ isPinned ? '📌' : '📍' }}
        </button>
        <button 
          class="copy-btn" 
          @click.stop="copyToClipboard"
          title="Копировать"
        >
          📋
        </button>
      </div>
    </div>
    <div v-if="copied" class="copy-notification">Скопировано!</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { hexToRgb } from '../../utils/colorUtils'

const props = defineProps({
  color: {
    type: String,
    required: true
  },
  format: {
    type: String,
    default: 'hex'
  },
  isPinned: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pin', 'unpin', 'copy'])

const copied = ref(false)

const rgbValue = computed(() => {
  const rgb = hexToRgb(props.color)
  if (!rgb) return ''
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
})

const isDarkText = computed(() => {
  const rgb = hexToRgb(props.color)
  if (!rgb) return false
  // Простая проверка яркости
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128
})

const copyToClipboard = async () => {
  try {
    const text = props.format === 'hex' ? props.color : rgbValue.value
    await navigator.clipboard.writeText(text)
    copied.value = true
    emit('copy', text)
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Ошибка копирования:', err)
  }
}

const togglePin = () => {
  if (props.isPinned) {
    emit('unpin', props.color)
  } else {
    emit('pin', props.color)
  }
}
</script>

<style scoped>
.color-card {
  position: relative;
  min-height: 150px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
}

.color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.color-card.pinned {
  border: 3px solid #42b883;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.color-info {
  background: rgba(255, 255, 255, 0.98);
  padding: 0.75rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.color-card.dark-text .color-info {
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  user-select: all;
  color: #1a1a1a;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
}

.color-card.dark-text .color-value {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.color-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.pin-btn,
.copy-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.35rem;
  border-radius: 5px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  line-height: 1;
}

.pin-btn:hover,
.copy-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.color-card.dark-text .pin-btn,
.color-card.dark-text .copy-btn {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.color-card.dark-text .pin-btn:hover,
.color-card.dark-text .copy-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.copy-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(66, 184, 131, 0.95);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  animation: fadeInOut 2s ease;
  pointer-events: none;
  z-index: 10;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
</style>

