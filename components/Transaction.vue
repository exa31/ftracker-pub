<script setup lang="ts">
interface transaction {
    type: string
    amount: number
    description: string
    createdAt: string
    _id: string
    updatedAt: string
}
const toast = useToast()
const props = defineProps<{ data: transaction, loading: boolean }>()
const icon = computed(() => {
    return props.data?.type.toLowerCase() === 'income' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'
})
const emit = defineEmits(['edit', 'delete'])

const action = [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => {
            emit('edit', props.data.createdAt.split('T')[0], props.data._id)
            return toast.clear()
        }
    }],
    [{
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
            toast.add({
                title: 'Delete',
                description: 'Are you sure you want to delete this transaction?',
                actions: [
                    {
                        label: 'Yes',
                        click: () => {
                            emit('delete', props.data._id)
                            return toast.clear()
                        }
                    },
                    {
                        label: 'No',
                        click: () => {
                            return toast.clear()
                        }
                    }
                ]
            })
        }
    }]
]

const color = computed(() => {
    return props.data?.type.toLowerCase() === 'income' ? 'green' : 'red'
})
</script>

<template>
    <div class="grid my-4 grid-cols-2">
        <div class="flex items-center justify-between">
            <div class="flex items-center  space-x-1">
                <UIcon :name="icon" :class="color" />
                <div>{{ props.data.description }}</div>
            </div>
            <div class="w-12">
                <UBadge color="white" size="lg" :label="props.data.type" />
            </div>

        </div>
        <div class="flex items-center justify-end space-x-2">
            <div>{{ currency(props.data.amount) }}</div>
            <div>
                <UDropdown :items="action" :popper="{ placement: 'bottom-start' }">
                    <UButton color="white" size="sm" variant="ghost" trailing-icon="i-heroicons-ellipsis-horizontal"
                        :loading="props.loading" />
                </UDropdown>
            </div>
        </div>
    </div>
</template>


<style scope>
.green {
    @apply text-green-600 dark:text-green-400;
}

.red {
    @apply text-red-600 dark:text-red-400;
}
</style>