import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

const vuetify = new Vuetify({
    theme: {
        themes: {
        light: {
                primary: '#607D8B',
                secondary: '#455A64',
                accent: '#607D8B',
                error: '#b71c1c',
            },
        },
    },
})

export default vuetify