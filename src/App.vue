<template>
  <div id="app">
    <nav class="main-nav">
      <router-link class="nav-link" to="/">🎨 Генератор</router-link>
      <router-link class="nav-link" to="/library">📚 Библиотека</router-link>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// App component
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 1rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background-color: #42b883;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.main-content {
  flex: 1;
  padding: 0;
  width: 100%;
}
</style>
