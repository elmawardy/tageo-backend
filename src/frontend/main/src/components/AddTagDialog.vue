<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Add GeoTag</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-text-field
                  label="hashtag*"
                  :placeholder="this.$store.state.currentHashtag"
                  required
                  prefix="#"
                  v-model="hashtag"
                  :error-messages="hashtagErrors"
                  @input="$v.hashtag.$touch()"
                  @blur="$v.hashtag.$touch()"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Title*"
                  required
                  v-model="title"
                  :error-messages="titleErrors"
                  @input="$v.title.$touch()"
                  @blur="$v.title.$touch()"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="12"
                md="12"
              >
              <v-textarea
                solo
                v-model="comment"
                name="input-7-4"
                label="Comment"
                full-width
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="submitData"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

  export default {
    mixins: [validationMixin],
    validations:{
      title: {required},
      hashtag: {required}
    },
    props:['parentDialog'],
    methods: {
      submitData(){
        this.$v.$touch()
        if (!this.$v.$invalid){
          this.dialog = false
          this.$emit('callback',{
            hashtag:this.hashtag,
            title:this.title,
            comment: this.comment,
          })
        }
      },
    },
    data: () => ({
      dialog: false,
      hashtag:'',
      title:'',
      comment:''
    }),
    watch: {
        parentDialog: function (val){
            this.dialog = val
        },
        dialog: function(val){
          this.$emit('updateDialog', val)
        }
    },
    computed:{
      hashtagErrors(){
        const errors = []
        if (!this.$v.hashtag.$dirty) return errors
        !this.$v.hashtag.required && errors.push('Hashtag is required')
        
        return errors
      },
      titleErrors(){
        const errors = []
        if (!this.$v.title.$dirty) return errors
        !this.$v.title.required && errors.push('Title is required')
        
        return errors
      }
    }
  }
</script>