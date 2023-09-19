<script>
import CoordinateComponent from './components/CoordinateComponent.vue';

export default {
  name: 'App',
  components: { CoordinateComponent },
  setup() {

  }
}
</script>

<template>
  <CoordinateComponent></CoordinateComponent>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
