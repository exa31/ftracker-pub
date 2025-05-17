export default defineNuxtRouteMiddleware( (to, from) => {
  const runtimeConfig = useRuntimeConfig();
  const cookie = useCookie("jwt");
  if (!cookie.value) {
    return navigateTo("/login");
  }
});
