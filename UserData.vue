<template>
  <div>
    <h1>User Profile</h1>
    <p v-for="item in list">{{ item }}</p>
    <button @click="fetchList">Fetch</button>
  </div>
</template>

<script>
import postRequest from './services/post'

export default {
  data() {
    return { list: [], rollNo, first_name, last_name, gender, course }
  },
  methods: {
    fetchList() {
      postRequest('post', 'http://127.0.0.1:3000/user/create', {
        rollNo: rollNo,
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        course: course
      }).then((r) => {
        this.list = r.data
      })
    }
  }
}
</script>
