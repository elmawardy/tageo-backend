<template>
    <div>
        <v-row justify="center">
            <v-dialog
            v-model="$store.state.searchDialog"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
            >
            <v-card>
                <v-toolbar
                dark
                color="primary"
                >
                <v-btn
                    icon
                    dark
                    @click="$store.commit('changeSearchDialogState',false)"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Search #hashtags</v-toolbar-title>
                </v-toolbar>
                <v-autocomplete
                    autofocus
                    v-model="select"
                    :loading="loading"
                    :items="items"
                    :search-input.sync="search"
                    prepend-inner-icon="mdi-magnify"
                    append-icon="none"
                    cache-items
                    flat
                    class="ma-4"
                    hide-details
                    :label="this.$store.state.currentHashtag"
                    solo
                    background-color="#f2f2f2"
                    rounded-lg
                ></v-autocomplete>
            </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import axios  from 'axios'

export default {
    props:['dialog'],
    data() {
        return {
            loading:false,
            select: null,
            search: null,
            items:[],
        }
    },
    watch: {
      search (val) {
        val && val !== this.select && this.querySelections(val)
      },
      select(val){
          if (val != '' && val!=null){
            this.$store.commit('changeCurrentHashtag',val)
            this.select = ''
            this.$store.commit('changeSearchDialogState',false)
          }
      }
    },
    methods: {
      querySelections (v) {
        this.loading = true
        axios.get(this.$store.state.backendURL+"/api/tag/search?searchtext="+v,{
           headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              'Access-Control-Allow-Origin': true,
              'Access-Control-Request-Headers': 'Content-Type, x-requested-with'
           }
        })
        .then(response => {
            this.loading = false
            this.items = response.data.hashtags
        })
        .catch(err =>  {
            this.loading = false
            console.log(err.response.data)
        })
      },
    },
}
</script>