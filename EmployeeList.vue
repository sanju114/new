<template>
  <div>
    <h1>User Profile</h1>
    <p v-for="item in list">{{ item }}</p>
    <button @click="fetchList">Fetch</button>
  </div>
</template>

<script>
import getRequest from './services/get'

export default {
  data() {
    return { list: [] }
  },
  methods: {
    fetchList() {
      // https://jsonplaceholder.typicode.com/todos
      // http://localhost:3000/users-profile
      getRequest('get', 'http://127.0.0.1:3000/users-profile').then((r) => {
        this.list = r.data
      })
    }
  }
}
</script>
