<script setup lang="ts">
interface transaction {
    type: string
    amount: number
    description: string
    createdAt: string
    updatedAt: string
}
interface props {
    transaction: transaction[]
    date: string
}

const props = defineProps<props>()

const totalDay = computed((): number => {
    let total = 0
    for (let transaction of props.transaction) {
        if (transaction.type.toLowerCase() === 'income') {
            total += transaction.amount
        } else {
            total -= transaction.amount
        }
    }
    return total
})

const color = computed(() => totalDay.value > 0 ? 'green' : totalDay.value < 0 ? 'red' : 'white')


</script>

<template>
    <div class="flex justify-between">
        <h3 class="text-2xl font-semibold">
            {{ props.date }}
        </h3>
        <h3 :class="color" class="text-2xl font-semibold">

            {{ currency(totalDay) }}
        </h3>
    </div>
</template>


<style scope>
.green {
    @apply text-green-600 dark:text-green-400;
}

.red {
    @apply text-red-600 dark:text-red-400;
}

.white {
    @apply dark:text-white text-black;
}
</style>