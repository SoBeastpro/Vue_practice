<template>
  <div class="not-found">
    <h1>404 - Страница не найдена</h1>
    <p>Запрошенная страница не существует.</p>
    <button @click="goHome" class="btn">Вернуться на главную</button>
    <div class="debug-info">
      <p><strong>Путь:</strong> {{ $route.path }}</p>
      <p><strong>Параметры:</strong> {{ JSON.stringify($route.params) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.debug-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  text-align: left;
  border-left: 4px solid #667eea;
}

.debug-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #495057;
}

.debug-info strong {
  color: #2c3e50;
}
</style>

