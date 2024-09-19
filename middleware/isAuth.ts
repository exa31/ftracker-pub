export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('isAuth middleware')
    const runtimeConfig = useRuntimeConfig()
    const cookie = useCookie('jwt')
    if (!cookie) {
        return navigateTo('/login')
    }
});