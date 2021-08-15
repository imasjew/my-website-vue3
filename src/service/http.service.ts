import APIURL from './apiurl.config';
import accountService from "./account.service";
import axios from 'axios';

// function request(config, success, failure) {
//   const instance = axios.create({
//     baseURL: ''
//   })
// }

// 这样也行
// axios.defaults.withCredentials = false;
// axios.defaults.headers.common['Authorization'] = document.cookie || '';
// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';//配置请求头

axios.interceptors.response.use(response => {
  console.log("响应拦截器 成功");
  return response.data;
}, error => {
  console.log("响应拦截器 失败", error.response);
  return Promise.reject(error.response);
});

function setToken() {
  const token = accountService.getToken();
  if (token) {
    return {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  }
}

const httpService = {
  register(name: string, pswd: string) {
    const data = {
      name: name,
      pswd: pswd
    }
    return axios.post(APIURL.register, data)
  },
  login(name: string, pswd: string) {
    const data = {
      name: name,
      pswd: pswd
    }
    return axios.post(APIURL.login, data)
  },
  auth() {
    return axios.post(APIURL.auth, {}, setToken())
  },
  getSongList(key: string) {
    return axios.get(APIURL.song_list + key)
  },
  checkSong(id: number) {
    return axios.get(APIURL.check_song + id)
  },
  getSongDetail(id: number) {
    return axios.get(APIURL.get_song_detail + id)
  },
  getSongUrl(id: number) {
    return axios.get(APIURL.song_url + id)
  },
  getLyric(id: number) {
    return axios.get(APIURL.get_lyric + id)
  },
  getFullSongDetail(id: number) {
    return Promise.all([
      new Promise((resolve, reject) => {
        httpService.getSongDetail(id).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      }),
      new Promise((resolve, reject) => {
        httpService.getSongUrl(id).then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      }),
    ]);
  },
}

export default httpService;
