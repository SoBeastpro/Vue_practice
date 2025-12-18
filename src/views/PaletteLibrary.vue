<template>
  <div class="palette-library">
    <header class="library-header">
      <h1>📚 Библиотека палитр</h1>
      <p>Управляйте своими сохраненными цветовыми палитрами</p>
    </header>

    <div class="library-controls">
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Поиск по названию или тегам..."
          class="search-input"
        />
      </div>

      <div class="filter-section">
        <label>Фильтр по тегам:</label>
        <div class="tag-filters">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTagFilter(tag)"
            :class="['tag-filter-btn', { active: selectedTags.includes(tag) }]"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <button @click="showCreateModal = true" class="create-btn">
        ➕ Создать новую палитру
      </button>
    </div>

    <div v-if="filteredPalettes.length === 0" class="empty-state">
      <p v-if="savedPalettes.length === 0">
        У вас пока нет сохраненных палитр. Создайте первую!
      </p>
      <p v-else>
        Не найдено палитр по вашему запросу.
      </p>
    </div>

    <div v-else class="palettes-grid">
      <div
        v-for="palette in filteredPalettes"
        :key="palette.id"
        class="palette-card"
      >
        <div class="palette-card-header">
          <h3>{{ palette.name }}</h3>
          <div class="card-actions">
            <button
              @click="editPalette(palette)"
              class="action-btn edit-btn"
              title="Редактировать"
            >
              ✏️
            </button>
            <button
              @click="deletePalette(palette.id)"
              class="action-btn delete-btn"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="palette-colors-preview">
          <div
            v-for="(color, index) in palette.colors"
            :key="index"
            class="color-preview"
            :style="{ backgroundColor: color }"
            :title="color"
          ></div>
        </div>

        <div class="palette-tags" v-if="palette.tags && palette.tags.length > 0">
          <span
            v-for="tag in palette.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>

        <div class="palette-card-footer">
          <button
            @click="loadPalette(palette)"
            class="load-btn"
          >
            Загрузить
          </button>
          <button
            @click="toggleFavorite(palette.id)"
            class="favorite-btn"
            :class="{ active: palette.favorite }"
          >
            {{ palette.favorite ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования палитры -->
    <Transition name="modal">
      <div v-if="showCreateModal || editingPalette" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingPalette ? 'Редактировать палитру' : 'Создать новую палитру' }}</h2>
          
          <div class="modal-form">
            <div class="form-group">
              <label>Название:</label>
              <input
                v-model="newPaletteName"
                type="text"
                placeholder="Название палитры"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Теги (через запятую):</label>
              <input
                v-model="newPaletteTags"
                type="text"
                placeholder="например: веб, дизайн, UI"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Цвета (HEX через запятую или пробел):</label>
              <input
                v-model="newPaletteColors"
                type="text"
                placeholder="#667eea #764ba2 #f093fb"
                class="form-input"
              />
            </div>

            <div class="form-actions">
              <button @click="savePalette" class="save-btn">
                💾 Сохранить
              </button>
              <button @click="closeModal" class="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const savedPalettes = ref([])
const searchQuery = ref('')
const selectedTags = ref([])
const showCreateModal = ref(false)
const editingPalette = ref(null)
const newPaletteName = ref('')
const newPaletteTags = ref('')
const newPaletteColors = ref('')

// Загружаем сохраненные палитры
onMounted(() => {
  loadPalettes()
})

const loadPalettes = () => {
  const saved = localStorage.getItem('savedPalettes')
  if (saved) {
    savedPalettes.value = JSON.parse(saved)
  }
}

const savePalettes = () => {
  localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value))
}

// Получаем все доступные теги
const availableTags = computed(() => {
  const tags = new Set()
  savedPalettes.value.forEach(palette => {
    if (palette.tags) {
      palette.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags).sort()
})

// Фильтрация палитр
const filteredPalettes = computed(() => {
  let filtered = savedPalettes.value

  // Поиск по названию
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(palette =>
      palette.name.toLowerCase().includes(query) ||
      (palette.tags && palette.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Фильтр по тегам
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(palette =>
      palette.tags && palette.tags.some(tag => selectedTags.value.includes(tag))
    )
  }

  // Сортируем: сначала избранные
  return filtered.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    return 0
  })
})

const toggleTagFilter = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const savePalette = () => {
  if (!newPaletteName.value.trim()) {
    alert('Введите название палитры')
    return
  }

  // Парсим цвета
  const colors = newPaletteColors.value
    .split(/[,\s]+/)
    .map(c => c.trim())
    .filter(c => c.startsWith('#') && c.length === 7)

  if (colors.length === 0) {
    alert('Введите хотя бы один валидный HEX цвет')
    return
  }

  // Парсим теги
  const tags = newPaletteTags.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)

  if (editingPalette.value) {
    // Редактирование
    const index = savedPalettes.value.findIndex(p => p.id === editingPalette.value.id)
    if (index > -1) {
      savedPalettes.value[index] = {
        ...savedPalettes.value[index],
        name: newPaletteName.value,
        colors: colors,
        tags: tags,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    // Создание новой
    const newPalette = {
      id: Date.now().toString(),
      name: newPaletteName.value,
      colors: colors,
      tags: tags,
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    savedPalettes.value.push(newPalette)
  }

  savePalettes()
  closeModal()
}

const editPalette = (palette) => {
  editingPalette.value = palette
  newPaletteName.value = palette.name
  newPaletteTags.value = palette.tags ? palette.tags.join(', ') : ''
  newPaletteColors.value = palette.colors.join(' ')
  showCreateModal.value = true
}

const deletePalette = (id) => {
  if (confirm('Вы уверены, что хотите удалить эту палитру?')) {
    savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
    savePalettes()
  }
}

const toggleFavorite = (id) => {
  const palette = savedPalettes.value.find(p => p.id === id)
  if (palette) {
    palette.favorite = !palette.favorite
    savePalettes()
  }
}

const loadPalette = (palette) => {
  // Сохраняем палитру как текущую и переходим на главную
  localStorage.setItem('currentPalette', JSON.stringify(palette.colors))
  router.push('/')
}

const closeModal = () => {
  showCreateModal.value = false
  editingPalette.value = null
  newPaletteName.value = ''
  newPaletteTags.value = ''
  newPaletteColors.value = ''
}
</script>

<style scoped>
.palette-library {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.library-header {
  text-align: center;
  margin-bottom: 3rem;
}

.library-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.library-header p {
  font-size: 1.2rem;
  color: #666;
}

.library-controls {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.tag-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  background: white;
  color: #667eea;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tag-filter-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.tag-filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.create-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.palette-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.palette-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.palette-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.palette-card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.palette-colors-preview {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.color-preview {
  flex: 1;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-preview:hover {
  transform: scale(1.1);
}

.palette-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  color: #667eea;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.palette-card-footer {
  display: flex;
  gap: 0.5rem;
}

.load-btn {
  flex: 1;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.load-btn:hover {
  background: #5568d3;
}

.favorite-btn {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  border-color: #ffd700;
}

.favorite-btn.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
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
  max-height: 90vh;
  overflow-y: auto;
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
  .palettes-grid {
    grid-template-columns: 1fr;
  }
}
</style>


