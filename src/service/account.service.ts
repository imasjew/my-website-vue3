const accountService = {
  getToken() {
    const strcookie = document.cookie;
    const arrcookie = strcookie.split("; ");
    for (let i = 0; i < arrcookie.length; i++) {
      const arr = arrcookie[i].split("=");
      if (arr[0] == "token") {
        return arr[1];
      }
    }
    return false;
  },
  login(name: string, token: string) {
    localStorage.setItem("username", name);
    document.cookie = 'token=' + token
  },
  logout() {
    localStorage.removeItem("username");
    const date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = "token=; expires=" + date.toUTCString();
  }
}
export default accountService;
