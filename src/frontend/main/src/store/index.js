import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    backendURL:'http://172.27.176.157',
    isPickingLocation:false,
    isWritingTagDetails:false,
    loadingOverlay:false,
    mapCenter:[30.033333,31.233334],
    userName:"Anonymous",
    userEmail:"Undefined",
    isLoggedIn:false,
    mapMarkers:[],
    currentHashtag:"eshtrymenno",
    searchDialog:false,
  },
  mutations: {
    updatePickingBoolean(state,payload){
      state.isPickingLocation = payload.value
    },
    updateWritingTag(state,payload){
      state.isWritingTagDetails = payload.value
    },
    updateLoadingOverlay(state,payload){
      state.loadingOverlay = payload.value
    },
    updateMapCenter(state,payload){
      state.mapCenter = payload.mapCenter
    },
    addMapMarker(state,payload){
      state.mapMarkers.push(payload.marker)
    },
    toggleLoggedInState(state){
      state.isLoggedIn = !state.isLoggedIn
    },
    changeLoginState(state,loginState){
      state.isLoggedIn = loginState
    },
    changeUserName(state,userName){
      state.userName = userName
    },
    deleteAllMapMarkers(state){
      state.mapMarkers = [];
    },
    changeSearchDialogState(state,isEnabled)
    {
      state.searchDialog = isEnabled; 
    },
    changeCurrentHashtag(state,hashtag)
    {
      state.currentHashtag = hashtag;
    },
    updateEmail(state,email){
      state.email = email
    }
  },
  actions: {
  },
  modules: {
  }
})
