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
  <p style="text-align:center;font-weight:bold;font-family:sans-serif;font-size:20px;">Sign Up</p>
  <form>
    <v-text-field
      v-model="name"
      :error-messages="nameErrors"
      label="Name"
      required
      @input="$v.email.$touch()"
      @blur="$v.email.$touch()"
    ></v-text-field>
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
    <v-text-field 
      v-model="retypepassword"
      type="password"
      label="Retype Password"
      :error-messages="retypePasswordErrors"
      @input="$v.retypepassword.$touch()"
      @blur="$v.retypepassword.$touch()"
    >
    </v-text-field>

    <v-btn
      class="mr-4 mt-5"
      @click="submit"
      color="primary"
    >
      Register
    </v-btn>
    <v-btn class="mt-5" @click="$router.back()">
      cancel
    </v-btn>
  </form>
</div>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, email , minLength , sameAs} from 'vuelidate/lib/validators'
  import axios from 'axios'

  export default {
    mixins: [validationMixin],

    validations: {
      name: { required },
      email: { required, email },
      password: {required , minLength},
      retypepassword: {
          required,
          sameAsPassword: sameAs('password')
      }
    },

    data: () => ({
      name:'',
      email: '',
      password:'',
      retypepassword:'',
    }),

    computed: {
      nameErrors(){
          const errors = []

          if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('E-mail is required')
          
          return errors
      },
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
      },
      retypePasswordErrors(){
        const errors = []

        if (!this.$v.retypepassword.$dirty) return errors
        !this.$v.retypepassword.required && errors.push('Password is required')
        !this.$v.retypepassword.sameAsPassword && errors.push('Password mismatch')

        return errors
      }
    },

    methods: {
      submit () {
        this.$v.$touch()
        if (!this.$v.$invalid){

          axios.post(this.$store.state.backendURL+"/api/auth/register",{
            email: this.email,
            password: this.password,
            name: this.name
          },{
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                "Access-Control-Allow-Origin": true,
                "Access-Control-Request-Headers": "Content-Type, x-requested-with"
                
            }
          })
          .then(response => {
            this.$toasted.show(response.data.Message,{
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
            this.$router.push('/signin')
          })
          .catch(err =>  {
            this.$toasted.show(err.response.data.Message,{
              theme: "bubble", 
              duration : 5000,
              icon:'error', 
              action : {
                text : 'Close',
                onClick : (e, toastObject) => {
                    toastObject.goAway(0);
                }
              },
            }) 
          })

          // fetch(this.$store.state.backendURL + "/api/auth/register",{
          //    mode:"no-cors",
          //    headers: {
          //       "Content-Type": "application/json"
          //    },
          //    method: "POST",
          //    body: JSON.stringify({
          //       email: this.email,
          //       password: this.password,
          //       name: this.email
          //    })
          // })
          // .then(response => {
          //   if (!response.ok){
          //     return response.json().then(error => {
          //       this.$toasted.show(error.Message,{
          //         theme: "bubble", 
          //         duration : 5000,
          //         icon:'check', 
          //         action : {
          //           text : 'Close',
          //           onClick : (e, toastObject) => {
          //               toastObject.goAway(0);
          //           }
          //         },
          //       }) 
          //     })
          //   }
          //   return response.json()
          // })
          // .then(response => {
          //   console.log(response)
          // })
          // .catch(error => {
          //   this.$toasted.show(error,{
          //     theme: "bubble", 
          //     duration : 5000,
          //     icon:'check', 
          //     action : {
          //       text : 'Close',
          //       onClick : (e, toastObject) => {
          //           toastObject.goAway(0);
          //       }
          //     },
          //   })
          // })
        }
      },
      clear () {
        this.$v.$reset()
      },
    },
  }
</script>