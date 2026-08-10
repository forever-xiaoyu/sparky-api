<template>
  <div class="card">
    <button @click="testRequest">Send sample request</button>
    <p>{{ result }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { request } from './index'

const result = ref('Click to call the configured /api endpoint.')

async function testRequest() {
  result.value = 'Request started…'
  try {
    const response = await request.get('/b/user/info', undefined, { retry: { count: 2, delay: 300 } })
    result.value = `Success: ${JSON.stringify(response.data)}`
  } catch {
    result.value = 'Request failed. Check the browser console and proxy target.'
  }
}

</script>

<style scoped>
.card {
  padding: 2em;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}
button {
  font-size: 1em;
  padding: 0.6em 1.2em;
  margin-bottom: 1em;
  cursor: pointer;
}
</style>
