<script setup lang="ts">
import {
    GoogleSignInButton,
    type CredentialResponse,
} from "vue3-google-signin";

useHead({
  title: 'FTraker - Login',
  meta: [
    { name: 'description', content: 'View your financial summary, including income and expenses.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const toast = useToast()
const router = useRouter()
const formData = reactive({
    email: '',
    password: '',
})
const store = useDefaultStore()
// handle success event
const handleLoginSuccess = (response: CredentialResponse) => {
    const { credential } = response;
    $fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
    }).then((res: any) => {
        if (res.statusCode === 201) {
            store.login(res.body.token)
            return router.push('/')
        } else if (res.statusCode === 404) {
            return alert("User not found")
        } else {
            return alert("An error occurred while trying to sign in")
        }
    }).catch((err: any) => {
        console.error(err)
       if (err.statusCode === 404) {
            toast.add(
                {
                    title: 'User not found',
                    description: "Please register to continue",
                }
            )
            router.push('/register')
        } else {
            handleLoginError()
        }
    })
}



// handle an error event
const handleLoginError = () => {
    toast.add(
        {
          title : 'Login Failed',
           description : "An error occurred while trying to sign in",
        }
    )
};

const error = ref(false)

const submit = async () => {
    try {
        if (!formData.email || !formData.password) {
            error.value = true
            return
        }
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        })
        if (res.ok) {
            const data = await res.json()
            const jwt = useCookie('jwt')
            jwt.value = data.body.token
            store.login(data.body.token)
            return router.push('/')
        } else {
            error.value = true
        }
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <div class="flex justify-center items-center h-screen">
      <UNotifications />
        <div class="w-full max-w-sm p-6 m-auto mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div class="flex justify-center mx-auto">
                <img class="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="">
            </div>

            <form @submit.prevent="submit" class="mt-6">
                <h5 v-if="error" class="text-red-500 text-center">Email or Password wrong</h5>
                <div>
                    <label for="email" class="block text-sm text-gray-800 dark:text-gray-200">Email</label>
                    <input v-model="formData.email" type="email"
                        class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40" />
                </div>
                <div class="mt-4">
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm text-gray-800 dark:text-gray-200">Password</label>
                    </div>
                    <input type="password" v-model="formData.password"
                        class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40" />
                </div>

                <div class="mt-6">
                    <button
                        class="w-full px-6 py-2.5 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                        Sign In
                    </button>
                </div>
            </form>

            <div class="flex items-center justify-between mt-4">
                <span class="w-1/5 border-b dark:border-gray-600 lg:w-1/5"></span>

                <h6 class="text-xs text-center text-gray-500 uppercase dark:text-gray-400 hover:underline">
                    or login with Social Media
                </h6>

                <span class="w-1/5 border-b dark:border-gray-400 lg:w-1/5"></span>
            </div>

            <div class="flex items-center justify-center mt-6 -mx-2">
                <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError"></GoogleSignInButton>
            </div>

            <p class="mt-8 text-xs font-light text-center text-gray-400"> Don't have an account? <NuxtLink
                    to="/register" class="font-medium text-gray-700 dark:text-gray-200 hover:underline">Create One
                </NuxtLink>
            </p>
        </div>
    </div>
</template>
