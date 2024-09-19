export const useDefaultStore = defineStore('default', {
    state: () => {
        return {
            isAuth: false,
            jwt: '',
        };
    },
    actions: {
        login(jwt: string) {
            this.$state.isAuth = true;
            this.$state.jwt = jwt;
        },
        logout() {
            this.$state.isAuth = false;
        },
    },
});