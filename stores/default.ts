export const useDefaultStore = defineStore("default", {
  state: () => {
    return {
      isAuth: false,
      jwt: "",
    };
  },
  actions: {
    login(jwt: string) {
      this.isAuth = true;
      this.jwt = jwt;
    },
    logout() {
      this.isAuth = false;
    },
  },
});
