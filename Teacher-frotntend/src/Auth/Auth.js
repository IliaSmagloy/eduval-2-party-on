import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import history from '../history';
import { SERVER_CONFIG } from '../Server/server-variables';
const axios = require('axios');

class Auth {

  accessToken;
  idToken;
  expiresAt;
  sub;
  payload;
  profile;

  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    responseType: 'token id_token',
    sso: false,
    scope: 'openid profile email user_metadata app_metadata'
  });

  constructor() {

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
    this.registerTeacher = this.registerTeacher.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);

    let accessToken = localStorage.getItem('accessToken');
    let idToken = localStorage.getItem('idToken');
    let expiresAt = localStorage.getItem('expiresAt');
    let sub = localStorage.getItem('sub');
    let payload = localStorage.getItem('payload');

    if (accessToken != null)
      this.accessToken = accessToken;
    if (idToken != null)
      this.idToken = idToken;
    if (expiresAt != null)
      this.expiresAt = expiresAt;
    if (sub != null)
      this.sub = sub;
  }

  login() {
    this.auth0.authorize();
    console.log("Auth0 Login");
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        console.log("Auth0 handled authentication");
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  setSession(authResult) {
    console.log("Set Session Called");
    // Set the time that the access token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;
    this.sub = authResult.idTokenPayload.sub;
    this.payload = authResult.idTokenPayload;
    let self = this;

    auth.getUserInfo(function(error, profile){
      if(error)
      {
        console.log("Error in getUserInfo in setSession in Auth.js");
      }
      else
      {
        self.profile = profile;
        localStorage.setItem('authProfile', JSON.stringify(profile));
      }
    });

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('expiresAt', expiresAt);
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('idToken', authResult.idToken);
    localStorage.setItem('sub', authResult.idTokenPayload.sub);
    localStorage.setItem('payload', JSON.stringify(authResult.idTokenPayload));

    // navigate to the home route
    this.registerTeacher();
  }

  getUserInfo(callback){
    let access_token = this.accessToken;
    if(access_token != null){
      this.auth0.client.userInfo(access_token, callback);
    }
  }

  registerTeacher(){
    let config = {
      headers: {
        'X-Api-Key': SERVER_CONFIG.xApiKey,
        'Authorization': "Bearer " + localStorage.getItem('idToken')
      }
    };
    // let teacher_id = localStorage.getItem('teacher_id');
    // if (teacher_id != null){
    //   history.replace('/');
    //   return;
    // }

    let sub = this.sub;
    if(sub == null){
      history.replace('/');
      return;
    }
    axios.get(SERVER_CONFIG.domain + '/teacher/byToken/'+new Buffer(sub).toString('base64'), config)
    .then(function(response){
      localStorage.setItem('teacher_id', response.data.id);
      history.replace('/');
    })
    .catch(function(error){
      if (!error.response || error.response.status !== 404){
        console.log(error);
        history.replace('/');
        return;
      }
      // lazy registration to EMON DB
      auth.getUserInfo(function(error, profile){
        if (error) {
          console.log(error);
          history.replace('/');
          return;
        }
        axios.post(SERVER_CONFIG.domain + '/teacher', {authIdToken: new Buffer(sub).toString('base64'),
          name: profile.nickname,
          email: profile.email,
          phoneNum: profile[SERVER_CONFIG.phone_number]}, config)
        .then(function(response){
          localStorage.setItem('teacher_id', response.data);
          history.replace('/');
        })
        .catch(function(error) {
          console.log(error);
          history.replace('/');
        });
      });
    });
  }


  renewSession() {
    console.log("Renew Session Called");
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.setSession(authResult);
       } else if (err) {
         this.logout();
         console.log(err);
         alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
       }
    });
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('sub');

    localStorage.removeItem('payload');
    localStorage.removeItem('teacher_id');
    localStorage.removeItem('profile');

    this.auth0.logout({
      returnTo: window.location.origin
    });

    // navigate to the home route
    // history.replace('/');
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }

}


let auth = new Auth();

export default auth;
