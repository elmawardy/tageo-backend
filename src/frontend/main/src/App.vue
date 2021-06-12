<template>
  <v-app>
    <v-main class="pa-0">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'


export default {
  name: 'App',
  mounted : function (){
    var token = window.localStorage.getItem('token')
    if (token){
      this.$store.commit('changeLoginState',true)

      axios.post(this.$store.state.backendURL+"/api/auth/getbasicinfo",{
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': true,
            'Access-Control-Request-Headers': 'Content-Type, x-requested-with',
            'Authorization': 'Bearer '+token
          }
      })
      .then(response => {
          this.$store.commit('changeUserName',response.data.Name)
          this.$store.commit('updateEmail',response.data.Email)
      })
      .catch(err =>  {
          console.log(err)
      })

    }
  }
};
</script>
