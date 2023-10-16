import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import { MsalPlugin, MsalPluginOptions } from './plugins/msal-plugin';

Vue.config.productionTip = false;


const options: MsalPluginOptions = {
  clientId: process.env.VUE_APP_MSAL_CLIENT_ID as string,
  loginAuthority:  process.env.VUE_APP_MSAL_LOGIN_AUTHORITY as string,
  passwordAuthority: process.env.VUE_APP_MSAL_PASSWORD_RESET_AUTHORITY as string,
  knownAuthority: process.env.VUE_APP_MSAL_KNOWN_AUTHORITY as string,
};

Vue.use(new MsalPlugin(), options);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
