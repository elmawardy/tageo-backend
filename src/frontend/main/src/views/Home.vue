<template>
<div>
<v-sheet
  height="100vh"
  class="overflow-hidden"
  style="position: relative;"
>
  <v-container class="fill-height" style="padding:0px;margin:0px;" fluid>
      <l-map @update:center="updateCenter" style="z-index:1" :zoom="zoom" :center="mapCenter" ref="myMap" :options="mapOptions">
        <l-tile-layer :url="'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'"></l-tile-layer>
        <l-marker
          v-for="(marker,index) in $store.state.mapMarkers"
          :key="index"
          :options="{fill:'orange'}"
          :lat-lng="[marker.lat,marker.lng]"> 
            <l-icon
              :icon-anchor="staticAnchor"
              class-name="markerIcon"
            >
              <svg class="mapMarkerSvg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 365 560" enable-background="new 0 0 365 560" xml:space="preserve">
                <g>
                  <path class="mapMarkerPath" fill="#00AEEF" d="M182.9,551.7c0,0.1,0.2,0.3,0.2,0.3S358.3,283,358.3,194.6c0-130.1-88.8-186.7-175.4-186.9   C96.3,7.9,7.5,64.5,7.5,194.6c0,88.4,175.3,357.4,175.3,357.4S182.9,551.7,182.9,551.7z M122.2,187.2c0-33.6,27.2-60.8,60.8-60.8   c33.6,0,60.8,27.2,60.8,60.8S216.5,248,182.9,248C149.4,248,122.2,220.8,122.2,187.2z"/>
                </g>
              </svg>
              <div>
                <p class="mapMarkerHeadline">
                  {{marker.title}}
                </p>
              </div>
              <!-- <img style="height:35px;" src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png"> -->
            </l-icon>
        </l-marker>
      </l-map>

      <div class="burger-icon" @click="drawer = !drawer">
        <v-btn
          class="mx-2"
          small
          color="white"
          style="min-width:35px;width:35px;"
        >
          <v-icon dark>
            mdi-menu
          </v-icon>
        </v-btn>
      </div>


      <div class="pin-container" v-if="$store.state.isPickingLocation" >
        <v-icon :size="30" color="red">mdi-pin</v-icon>
      </div>

      <v-row
        align="center"
        justify="center"
        class="doneBtn"
      >
        <v-btn
          depressed
          color="error"
          @click="disablePickingLocation()"
          v-if="$store.state.isPickingLocation"
          class="ma-1"
        >
            Cancel
        </v-btn>
        <v-btn
          depressed
          color="primary"
          @click="showAddTagDialog=true"
          v-if="$store.state.isPickingLocation"
          class="ma-1"
        >
            Next
            <v-icon
              right
              dark
            >
              mdi-arrow-right
            </v-icon>
        </v-btn>
      </v-row>

      <div class="text-center" style="border-radius:20px;" v-if="!drawer && !$store.state.isPickingLocation && !$store.state.searchDialog">
        <v-bottom-sheet
          v-model="bottomSheet"
          persistent
          :hide-overlay="true"
          max-width="90vw"
        >
          <v-sheet
            class="text-center"
            height="200px"
            style="border-radius:5px;"
          >
            <v-text-field 
              solo 
              flat
              class="px-2 pt-2"
              prepend-inner-icon="mdi-magnify"
              background-color="#f2f2f2"
              :label="`#${this.$store.state.currentHashtag}`"
              @click="$store.commit('changeSearchDialogState',true)"
            ></v-text-field>
            <v-btn @click="enablePickingLocation" style="width:90%" color="primary" depressed large>
              <v-icon
                left
                dark
              >
                mdi-plus
              </v-icon>
              Add new Pin
            </v-btn>
            <v-btn :loading="isRefreshingPins" @click="refreshPins" class="mt-2" style="width:90%;" large outlined color="green darken-3">
              <v-icon
                left
                dark
              >
                mdi-refresh
              </v-icon>
              Refresh Pins
            </v-btn>
          </v-sheet>
        </v-bottom-sheet>
      </div>

      <AddTagDialog @callback="TagInfoPickupCallback" @updateDialog="updateAddTagDialog" :parentDialog="showAddTagDialog" />
      
  </v-container>

</v-sheet>

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

<Search :dialog="searchDialog"/>

<v-overlay :value="$store.state.loadingOverlay">
  <v-progress-circular
    indeterminate
    size="64"
  ></v-progress-circular>
</v-overlay>
</div>
</template>

<script>

import AddTagDialog from '../components/AddTagDialog'
import Avatar from 'vue-avatar'
import axios from 'axios'
import Search from '../components/Search'
import { LIcon } from "vue2-leaflet";

export default {
    methods: {
      disablePickingLocation(){
        this.$store.commit('updatePickingBoolean',{'value':false})
      },
      enablePickingLocation(){
        this.$store.commit('updatePickingBoolean',{'value':true})
      },
      enableWritingTagDetails(){
        this.$store.commit('updateWritingTag',{'value':true})
      },
      disableWritingTagDetails(){
        this.$store.commit('updateWritingTag',{'value':false})
      },
      updateCenter(bounds){
        this.$store.commit('updateMapCenter',{mapCenter:{lat:bounds.lat,lng:bounds.lng}})
        this.getNearbyTags();
      },
      refreshPins(){
        this.isRefreshingPins = true
        this.getNearbyTags(true)
      },
      getNearbyTags(removeCurrentMarkers=false){
        if (removeCurrentMarkers)
          this.$store.commit('deleteAllMapMarkers')
        axios.get(this.$store.state.backendURL+"/api/tag/getnearby",{
          params:{
              Latitude:this.$store.state.mapCenter.lat,
              Longitude:this.$store.state.mapCenter.lng,
              RangeInMeters:5000,
              Hashtag:this.$store.state.currentHashtag
          }
        },{
          headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              'Access-Control-Allow-Origin': true,
          }
        })
        .then(response => {
          this.isRefreshingPins = false
          for(var i=0;i<response.data.tags.length;i++){
            this.addMapMarker(response.data.tags[i].coordinates[0],response.data.tags[i].coordinates[1],response.data.tags[i].title)
          }
        })
        .catch(err =>  {
          this.isRefreshingPins = false
          console.log(err)
        })
      },
      updateAddTagDialog(val){
        this.showAddTagDialog = val
      },
      signout(){
        axios.post(this.$store.state.backendURL+"/api/auth/signout",{
           JWT:window.localStorage.getItem('token')
        },{
           headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              'Access-Control-Allow-Origin': true,
              'Access-Control-Request-Headers': 'Content-Type, x-requested-with'
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
            window.localStorage.removeItem('token')
            window.localStorage.removeItem('userName')
            this.$store.commit('changeLoginState',false)
            this.$store.commit('changeUserName','')
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
      },
      TagInfoPickupCallback(taginfo){
        this.$store.commit('updateLoadingOverlay',{'value':true})
        this.$store.commit('updatePickingBoolean',{value:false})
        this.submitNewTag(taginfo)
      },
      addMapMarker(lat,lng,title="Undefined"){
        this.$store.commit('addMapMarker',{marker:{lat,lng,title}})
      },
      submitNewTag(taginfo){
        var jwt = window.localStorage.getItem('token')
          if (jwt){
            axios.post(this.$store.state.backendURL+"/api/tag/add",{
            hashtag:taginfo.hashtag,
            title:taginfo.title,
            comment:taginfo.comment,
            coordinates:[this.$store.state.mapCenter.lat,this.$store.state.mapCenter.lng]
          },{
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': true,
                'Authorization' : 'Bearer '+jwt
            }
          })
          .then(response => {
            this.$store.commit('updateLoadingOverlay',{'value':false})
            this.$toasted.show(response.data,{
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
            this.addMapMarker(this.$store.state.mapCenter.lat,this.$store.state.mapCenter.lng,taginfo.title)
            this.$store.commit('updateLoadingOverlay',{'value':false})
          })
          .catch(()=>{
              this.$store.commit('updateLoadingOverlay',{'value':false})
              this.$toasted.show("error occured!",{
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
    },
    data () {
      return {
        staticAnchor: [13, 39],
        drawer: null,
        zoom:16,
        showAddTagDialog:false,
        mapCenter: [30.033333,31.233334],
        bottomSheet:true,
        mapOptions:{
          zoomControl:false,
        },
        searchDialog:false,
        isRefreshingPins:false,
      }
    },
    mounted() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((location) => {
          this.mapCenter = [location.coords.latitude,location.coords.longitude]
          
          axios.get(this.$store.state.backendURL+"/api/tag/getnearby",{
             params:{
                Latitude:location.coords.latitude,
                Longitude:location.coords.longitude,
                RangeInMeters:5000,
                Hashtag:this.$store.state.currentHashtag
             }
          },{
             headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': true,
             }
          })
          .then(response => {
             for(var i=0;i<response.data.tags.length;i++){
               this.addMapMarker(response.data.tags[i].coordinates[0],response.data.tags[i].coordinates[1],response.data.tags[i].title)
             }
          })
          .catch(err =>  {
             console.log(err)
          })
          
          // console.log(location.coords.accuracy);
        });
      }
    },
    computed:{
        currentHashtag(){
            return this.$store.state.currentHashtag
        }
    },
    watch:{
        currentHashtag(){
            this.getNearbyTags(true)
        }
    },
    components:{
      AddTagDialog,
      Avatar,
      LIcon,
      Search
    },
}
</script>

<style>
  .doneBtn{
    z-index: 2;
    position: absolute;
    bottom:15vh;
    left:0;
    right: 0;
  }
  .pin-container{
    z-index: 2;
    position: absolute;
    left:0;
    right: 0;
    text-align: center;
  }
  .burger-icon{
    z-index: 2;
    position: absolute;
    top:10px;
    text-align: center;
  }

  .mdi-pin::before {
    margin-top: -75px;
  }
  .mapMarkerHeadline {
    font-size:12px;
    background-color: yellow;
  }  
  .markerIcon {
    /* text-align: center; */
    width: auto !important;
    height: auto !important;
    /* margin-top: -33px !important; */
  }
  .mapMarkerSvg{
    width:27px;
    height:42px;
  }
  .mapMarkerPath{
    fill: seagreen;
  }
  .fab-item-container.fab-size-big
  {
    top: -10px !important;
  }

</style>