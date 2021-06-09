<template>
    <div>
        <v-app-bar
            color="primary accent-4"
            dense
            dark
            v-if="!$store.state.isPickingLocation"
        >
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

            <v-toolbar-title>Profile</v-toolbar-title>

            <v-spacer></v-spacer>
        </v-app-bar>


        <v-container>
            <v-row>
                <v-col>
                    <v-text-field
                    label="Name"
                    :error-messages="nameErrors"
                    @input="$v.name.$touch()"
                    class="mt-6"
                    v-model="name"
                    hide-details="auto"
                    ></v-text-field>
                    <!-- <v-text-field
                    label="Email"
                    prepend-inner-icon="mdi-email"
                    :error-messages="emailErrors"
                    @input="$v.email.$touch()"
                    class="mt-4"
                    type="email"
                    solo
                    v-model="email"
                    hide-details="auto"
                    ></v-text-field> -->

                    <v-btn block class="mt-4" @click="dialog=true">
                         <v-icon
                            left
                            dark
                        >
                            mdi-lock-outline
                        </v-icon>
                        Change Password
                    </v-btn>

                    <v-btn color="success" block class="mt-10">
                        <v-icon left>
                            mdi-content-save
                        </v-icon>
                        Save
                    </v-btn>

                    <v-btn block color="red" outlined class="mt-5">
                         <v-icon left>
                            mdi-trash-can-outline
                        </v-icon>
                        Delete
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>


<!-- Change Password dialog -->
    <v-dialog
    v-model="dialog"
    >
    <v-card>
        <v-card-title>
          <span class="headline">Change password</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
                <v-text-field
                    label="Current password"
                    prepend-icon="mdi-lock-check"
                    :error-messages="currentpasswordErrors"
                    @input="$v.currentpassword.$touch()"
                    class="mt-6"
                    v-model="currentpassword"
                    type="password"
                    hide-details="auto"
                    ></v-text-field>
                     <v-text-field
                    label="New password"
                    :error-messages="newpasswordErrors"
                    @input="$v.newpassword.$touch()"   
                    prepend-icon="mdi-lock-plus-outline"
                    class="mt-6"
                    v-model="newpassword"
                    type="password"
                    hide-details="auto"
                    ></v-text-field>
                     <v-text-field
                    label="New password again"
                    prepend-icon="mdi-lock-plus-outline"
                    :error-messages="newpasswordagainErrors"
                    @input="$v.newpasswordagain.$touch()"   
                    class="mt-6"
                    v-model="newpasswordagain"
                    type="password"
                    hide-details="auto"
                    ></v-text-field>
            </v-row>
            <v-row class="mt-3">
                <v-col>
                    <v-btn @click="dialog=false" depressed>Cancel</v-btn>
                </v-col>
                <v-col @click="changePassword">
                    <v-btn color="success">Change</v-btn>
                </v-col>
            </v-row>
          </v-container>
        </v-card-text>
    </v-card>
    </v-dialog>
<!-- !Change Password dialog -->





        <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
        >
        <v-list-item  v-if="$store.state.isLoggedIn">
            <v-list-item-avatar>
            <avatar :username="$store.state.userName"></avatar>
            </v-list-item-avatar>

            <v-list-item-content>
            <v-list-item-title>{{$store.state.userName}}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>


        <v-list dense v-if="$store.state.isLoggedIn">

            <v-list-item
            link
            to="/home"
            >
            <v-list-item-icon>
                <v-icon>mdi-home</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
                <v-list-item-title>Home</v-list-item-title>
            </v-list-item-content>
            </v-list-item>

            <v-list-item
            link
            >
            <v-list-item-icon>
                <v-icon>mdi-account-circle</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
                <v-list-item-title>Profile</v-list-item-title>
            </v-list-item-content>
            </v-list-item>

            <v-list-item
            link
            to="/mytags"
            >
            <v-list-item-icon>
                <v-icon>mdi-pound</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
                <v-list-item-title>My Tags</v-list-item-title>
            </v-list-item-content>
            </v-list-item>


            <v-divider class="ma-3"></v-divider>

            <v-list-item
            link
            @click="signout()"
            >
            <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
                <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item-content>
            </v-list-item>

        </v-list>

        <div style="text-align:center" class="ma-3" v-if="!$store.state.isLoggedIn">
            <p style="text-align:center;font-size:15px;">Welcome 👋</p>
            <v-btn primary color="primary" @click="$router.push('/Signin')">
            Sign In
            <v-icon
                right
                dark
            >
                mdi-login
            </v-icon>
            </v-btn>
            <p class="mt-5" style="text-align:center;font-size:15px;">Don't have an account yet ? 🤔 <span>no problem , just register</span></p>
            <v-btn @click="$router.push({path:'register'})">
            Register
            </v-btn>
        </div>

        </v-navigation-drawer>

        <v-overlay :value="loading">
            <v-progress-circular
                indeterminate
                size="64"
            ></v-progress-circular>
        </v-overlay>


    </div>
</template>

<script>
import Avatar from 'vue-avatar'
import axios from 'axios'
import { validationMixin } from 'vuelidate'
import { required, email , minLength , sameAs} from 'vuelidate/lib/validators'

export default {

    mixins: [validationMixin],

    validations: {
      name: { required },
      email: { required, email },
      currentpassword: {required},
      newpassword: {required , minLength},
      newpasswordagain: {
          required,
          sameAsPassword: sameAs('newpassword')
      }
    },


    data() {
        return {
            drawer:null,
            name:"",
            email:"",
            dialog:false,
            loading:false,
            currentpassword:"",
            newpassword:"",
            newpasswordagain:""
        }
    },
    methods: {
        changePassword:function(){
            this.$v.currentpassword.$touch()
            this.$v.newpassword.$touch()
            this.$v.newpasswordagain.$touch()
            if (!this.$v.currentpassword.$invalid && !this.$v.newpassword.$invalid && !this.$v.newpasswordagain.$invalid){
                this.loading = true;
                var token = window.localStorage.getItem('token')
                if (token){
                    axios.post(this.$store.state.backendURL+"/api/auth/changepassword",{
                        "Jwt" : token,
                        "Newpassword" : this.newpassword,
                        "CurrentPassword" : this.currentpassword
                    },{
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8',
                        'Access-Control-Allow-Origin': true,
                        'Access-Control-Request-Headers': 'Content-Type, x-requested-with'
                    }
                    })
                    .then(response => {
                        this.loading = false
                        this.dialog = false
                        this.currentpassword = ""
                        this.newpassword = ""
                        this.newpasswordagain = ""

                        this.$v.currentpassword.$reset()
                        this.$v.newpassword.$reset()
                        this.$v.newpasswordagain.$reset()

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
                    })
                    .catch(err =>  {
                        console.log(err.response)
                        this.loading = false
                        
                        this.$toasted.show(err.response.data,{
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
            }
        }
    },
    components : {
        Avatar,
    },
    mounted() {
        this.name = this.$store.state.userName;
        this.email = this.$store.state.userEmail;
    },
    computed:{
         nameErrors(){
          const errors = []

            if (!this.$v.name.$dirty) return errors
            !this.$v.name.required && errors.push('Name is required')
            
            return errors
        },
        emailErrors () {
            const errors = []
            if (!this.$v.email.$dirty) return errors
            !this.$v.email.email && errors.push('Must be valid e-mail')
            !this.$v.email.required && errors.push('E-mail is required')
            return errors
        },
        currentpasswordErrors(){
            const errors = []
            if (!this.$v.currentpassword.$dirty) return errors
            !this.$v.currentpassword.required && errors.push('required')
            return errors
        },
        newpasswordErrors(){
            const errors = []
            if (!this.$v.currentpassword.$dirty) return errors
            !this.$v.currentpassword.required && errors.push('required')
            return errors
        },
        newpasswordagainErrors(){
            const errors = []

            if (!this.$v.newpasswordagain.$dirty) return errors
            !this.$v.newpasswordagain.required && errors.push('required')
            !this.$v.newpasswordagain.sameAsPassword && errors.push('Password mismatch')

            return errors
        },
        nameComputed(){
            return this.$store.state.userName
        },
        emailComputed(){
            return this.$store.state.userEmail
        }
    },
    watch:{
        nameComputed(val){
            this.name = val
        },
        emailComputed(val){
            this.email = val
        }
    }

}
</script>