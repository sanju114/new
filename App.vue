<template>
  <div>
    <router-link to="/">Home</router-link> <br />
    <router-link to="/login">Login</router-link><br />
    <router-link to="/profile">Profile</router-link><br />
    <router-link to="/component-a">Component A</router-link><br />
    <router-link to="/component-b">Component B</router-link><br />
    <router-link to="/computed-a">Computed A</router-link><br />
    <router-link to="/parent-c">Parent C</router-link><br />
    <router-link to="/increment-t">Increment T</router-link><br />
    <router-link to="/employee-list">Employee List</router-link><br />
    <router-link to="/user-data">User Data</router-link><br />
    <router-view></router-view>
  </div>
</template>

<script setup lang="js"></script>

//
<style scoped></style>
