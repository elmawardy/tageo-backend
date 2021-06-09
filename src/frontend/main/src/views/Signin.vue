<template>
<div class="pa-5">
  <div style="text-align:center;">
    <v-img
      width="140px"
      style="margin-left:calc(50% - 70px)"
      src="https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX19074829.jpg"
    >
    </v-img>
  </div>
  <p style="text-align:center;font-weight:bold;font-family:sans-serif;font-size:20px;">Signin</p>
  <form>
    <v-text-field
      v-model="email"
      :error-messages="emailErrors"
      label="E-mail"
      required
      @input="$v.email.$touch()"
      @blur="$v.email.$touch()"
    ></v-text-field>
    <v-text-field 
      v-model="password"
      required
      type="password"
      label="Password"
      :error-messages="passwordErrors"
      @input="$v.password.$touch()"
      @blur="$v.password.$touch()"
    >
    </v-text-field>

    <v-btn
      class="mr-4 mt-5"
      @click="submit"
      color="primary"
    >
      signin
    </v-btn>
    <v-btn @click="clear" class="mt-5">
      register
    </v-btn>
  </form>
</div>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, email } from 'vuelidate/lib/validators'
  import axios from 'axios'

  export default {
    mixins: [validationMixin],

    validations: {
      email: { required, email },
      password: {required}
    },

    data: () => ({
      email: '',
      password:'',
    }),

    computed: {
      emailErrors () {
        const errors = []
        if (!this.$v.email.$dirty) return errors
        !this.$v.email.email && errors.push('Must be valid e-mail')
        !this.$v.email.required && errors.push('E-mail is required')
        return errors
      },
      passwordErrors(){
        const errors = []
        if (!this.$v.password.$dirty) return errors
        !this.$v.password.required && errors.push('Password is required')
        return errors
      }
    },

    methods: {
      submit () {
        this.$v.$touch()
        if (!this.$v.$invalid){
          axios.post(this.$store.state.backendURL+"/api/auth/signin",{
            email:this.email,
            password:this.password
          },{
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              'Access-Control-Allow-Origin': true,
              'Access-Control-Request-Headers': 'Content-Type, x-requested-with'
            }
          })
          .then(response => {
              this.$toasted.show("Welcome back!",{
                theme: "bubble", 
                duration : 5000,
                icon:'check', 
                action : {
                  text : 'Close',
                  onClick : (e, toastObject) => {
                      toastObject.goAway(0);
                  }
                },
              })
              window.localStorage.setItem('token',response.data.Jwt)

              // get user basic info
              axios.post(this.$store.state.backendURL+"/api/auth/getbasicinfo",{
                 JWT:response.data.Jwt
              },{
                 headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': true,
                    'Access-Control-Request-Headers': 'Content-Type, x-requested-with'
                 }
              })
              .then(response => {
                 this.$store.commit('changeUserName',response.data.Name)
              })
              .catch(err =>  {
                 console.log(err)
              })

              this.$store.commit('changeLoginState',true)
              this.$router.push('/Home')
          })
          .catch(err =>  {
              this.$toasted.show(err.response.data.Message,{
                theme: "bubble", 
                duration : 5000,
                icon:'check', 
                action : {
                  text : 'Close',
                  onClick : (e, toastObject) => {
                      toastObject.goAway(0);
                  }
                },
              })
          })
        }
      },
      clear () {
        this.$v.$reset()
        this.email = ''
      },
    },
  }
</script>