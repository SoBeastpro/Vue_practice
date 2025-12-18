<template>
  <div class="palette-display">
    <div class="palette-grid" :style="{ gridTemplateColumns: `repeat(${colors.length}, 1fr)` }">
      <ColorCard
        v-for="(color, index) in colors"
        :key="`${color}-${index}`"
        :color="color"
        :format="format"
        :is-pinned="pinnedColors.includes(color)"
        @pin="handlePin"
        @unpin="handleUnpin"
        @copy="handleCopy"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ColorCard from './ColorCard.vue'

const props = defineProps({
  colors: {
    type: Array,
    required: true
  },
  format: {
    type: String,
    default: 'hex'
  }
})

const emit = defineEmits(['color-pinned', 'color-unpinned', 'color-copied'])

const pinnedColors = ref([])

// Загружаем закрепленные цвета из localStorage
const loadPinnedColors = () => {
  const saved = localStorage.getItem('pinnedColors')
  if (saved) {
    pinnedColors.value = JSON.parse(saved)
  }
}

// Сохраняем закрепленные цвета в localStorage
const savePinnedColors = () => {
  localStorage.setItem('pinnedColors', JSON.stringify(pinnedColors.value))
}

loadPinnedColors()

const handlePin = (color) => {
  if (!pinnedColors.value.includes(color)) {
    pinnedColors.value.push(color)
    savePinnedColors()
    emit('color-pinned', color)
  }
}

const handleUnpin = (color) => {
  const index = pinnedColors.value.indexOf(color)
  if (index > -1) {
    pinnedColors.value.splice(index, 1)
    savePinnedColors()
    emit('color-unpinned', color)
  }
}

const handleCopy = (color) => {
  emit('color-copied', color)
}

watch(() => props.colors, () => {
  // При генерации новой палитры сохраняем закрепленные цвета
  savePinnedColors()
}, { deep: true })
</script>

<style scoped>
.palette-display {
  width: 100%;
  margin: 2rem 0;
}

.palette-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
}

@media (max-width: 768px) {
  .palette-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
  }
}
</style>


