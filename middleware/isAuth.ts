export default defineNuxtRouteMiddleware(async (to, from) => {
  const runtimeConfig = useRuntimeConfig();
  const cookie = useCookie("jwt");
  if (!cookie) {
    return navigateTo("/login");
  }
});
