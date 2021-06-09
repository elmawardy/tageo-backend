<template>
<div>
 <v-app-bar
    color="primary accent-4"
    dense
    dark
    v-if="!$store.state.isPickingLocation"
  >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>My Tags</v-toolbar-title>

    <v-spacer></v-spacer>
 </v-app-bar>


<v-list
    two-line
    subheader>

    <v-subheader>My Tags</v-subheader>

    <div v-if="mytags.length>0">
      <v-list-item v-for="(item,index) in mytags" :key="index">

          <v-list-item-content>
              <v-list-item-title>{{item.title}}</v-list-item-title>
              <v-list-item-subtitle>#{{item.hashtag}}</v-list-item-subtitle>
              <v-list-item-subtitle>{{item.comment}}</v-list-item-subtitle>
              <v-list-item-subtitle>{{item.coordinates[0]}},{{item.coordinates[1]}}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
              <v-btn
                icon
                color="pink"
                @click="requestDeleteTag(item.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
          </v-list-item-action>

      </v-list-item>
    </div>
    <div v-else>
      <p class="font-weight-medium text--disabled text-center">
        No tags belong to this account.
      </p>
    </div>
    
</v-list>


<v-dialog
    v-model="confirmationDialog"
    max-width="290"
    persistent
>
    <v-card>
        <v-card-title class="headline">
            Confirmation !
        </v-card-title>
        <v-card-text>Are you sure you want to delete this tag ?</v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
            color="green darken-1"
            text
            @click="confirmationDialog=false"
            >
            No
            </v-btn>
            <v-btn
            color="green darken-1"
            text
            @click="deleteTag"
            :loading="isDeleting"
            >
            Yes
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>


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
      to="/profile"
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
</div>
</template>

<script>
import Avatar from 'vue-avatar'
import axios from 'axios'

export default {
    data() {
        return {
            drawer:null,
            confirmationDialog:false,
            mytags: [],
            isDeleting: false,
            selectedTagId: "0",
        }
    },
    mounted() {
      this.getUserTags()
    },
    methods: {
      requestDeleteTag : function(tagId){
        this.confirmationDialog=true
        this.selectedTagId = tagId
      },
      deleteTag: function(){
        var jwt = window.localStorage.getItem('token')
        if (jwt){
          this.isDeleting = true
          axios.post(this.$store.state.backendURL+"/api/tag/delete",{
            TagId: this.selectedTagId
          },{
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': true,
                'Access-Control-Request-Headers': 'Content-Type, x-requested-with',
                'Authorization' : 'Bearer '+jwt
            }
          })
          .then(response => {
            this.isDeleting = false
            this.confirmationDialog = false

            this.$toasted.show(response.data.message,{
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


              // remove tag from mytags variable
              for (var i =0;i<this.mytags.length;i++){
                if (this.mytags[i].id == this.selectedTagId)
                {
                  this.mytags.splice(i,1)
                }
              }
          })
          .catch(err =>  {
            this.isDeleting = false
            this.confirmationDialog = false
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
        }else{
          this.$toasted.show("your session expired kindly login again",{
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
        }
      },
      getUserTags: function(){
        var jwt = window.localStorage.getItem('token')

        if (jwt){
          axios.post(this.$store.state.backendURL+"/api/tag/getusertags",{
          },{
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': true,
                'Access-Control-Request-Headers': 'Content-Type, x-requested-with',
                'Authorization' : 'Bearer '+jwt,
            }
          })
          .then(response => {
            this.mytags = response.data.mytags;
          })
          .catch(err =>  {
            console.log(err)
          })
        }

      }
    },
    components : {
        Avatar,
    }
}
</script>