<script setup lang="ts">


const haveError = ref(false)

const router = useRouter()

const error = reactive<{
    name?: string,
    email?: string,
    password?: string,
    passwordConfirmation?: string
}>({})

const formData = reactive({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
})


const handleSubmit = () => {
    haveError.value = false

    if (formData.password !== formData.passwordConfirmation) {
        error.passwordConfirmation = 'Password confirmation does not match'
        haveError.value = true
    } else {
        error.passwordConfirmation = ''
    }

    if (formData.password.length < 6) {
        error.password = 'Password must be at least 6 characters'
        error.passwordConfirmation = 'Password must be at least 6 characters'
        haveError.value = true
    } else {
        error.password = ''
    }
    if (formData.name.length < 3) {
        error.name = 'Name must be at least 3 characters'
        haveError.value = true
    } else {
        error.name = ''
    }

    if (!testGmail(formData.email)) {
        error.email = 'Email must be a valid Gmail address'
        haveError.value = true
    } else {
        error.email = ''
    }

    if (!haveError.value) {
        const { passwordConfirmation, ...formdata } = formData
        $fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(formdata)
        }).then((res: any) => {
            if (res.statusCode === 201) {
                router.push('/login')
            } else if (res.statusCode === 409) {
                alert('Email has already been taken')
            } else {
                alert('An error occurred')
            }
        }).catch(() => {
            alert('An error occurred')
        })
    }
}

</script>

<template>
    <section class="h-screen flex container mx-auto justify-center items-center">
        <div class="max-w-4xl   w-full  p-6 bg-white rounded-md shadow-md dark:bg-gray-800">
            <h2 class="text-lg font-semibold text-gray-700 capitalize dark:text-white">Register</h2>
            <form @submit.prevent="handleSubmit">
                <div class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                    <div class="m-4">
                        <label class="text-gray-700 dark:text-gray-200" for="name">Name</label>
                        <input v-model="formData.name" id="name" type="text"
                            class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring">
                        <p class="text-red-400" v-if="error?.name">{{ error?.name }}</p>
                    </div>

                    <div class="m-4">
                        <label class="text-gray-700 dark:text-gray-200" for="emailAddress">Email Address</label>
                        <input v-model="formData.email" id="email" type="email"
                            class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring">
                        <p class="text-red-400" v-if="error?.email">{{ error?.email }}</p>
                    </div>
                    <div class="m-4">
                        <label class="text-gray-700 dark:text-gray-200" for="password">Password</label>
                        <input v-model="formData.password" id="password" type="password"
                            class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring">
                        <p class="text-red-400" v-if="error?.password">{{ error?.password }}</p>
                    </div>
                    <div class="m-4">
                        <label class="text-gray-700 dark:text-gray-200" for="passwordConfirmation">Password
                            Confirmation</label>
                        <input v-model="formData.passwordConfirmation" id="passwordConfirmation" type="password"
                            class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring">
                        <p class="text-red-400" v-if="error?.passwordConfirmation">{{ error?.passwordConfirmation }}</p>
                    </div>
                </div>
                <div class="flex justify-between mt-6">
                    <NuxtLink to="/login" class="text-green-400 hover:text-green-600 transition-all duration-200">
                        already have account?</NuxtLink>
                    <button
                        class="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">Save</button>
                </div>
            </form>
        </div>
    </section>
</template>