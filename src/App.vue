<template>
  <div class="card">
    <button @click="testLoading">Test Loading (3s)</button>
    <p>
      Click the button to simulate a 3-second network request and test the global loading component.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { request } from './index'

function testLoading() {
  console.log('Starting 3-second delayed request to test loading...')
  
  // 发起一个请求，并传入 _mockDelay 参数
  // 这个请求会先在请求拦截器中暂停 3000ms
  // 然后才会真正发出，即使后端 500 或 404 也能看到 Loading
  request.get('/login', undefined, {
    _mockDelay: 1000
  }).then(res => {
    console.log('Delayed request finished!', res)
  }).catch(err => {
    console.error('Delayed request failed as expected.', err)
  })
}

/*
// --- 原有代码，保留作为参考 ---
console.log(request)
request.getQs('/test', { a: 1, b: 2 }).then((res) => {})
*/

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
