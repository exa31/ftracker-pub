    <script lang="ts" setup>
    interface InputEvent extends Event {
        target: HTMLInputElement & {
            value: string;
        };
    }

    import { z } from "zod";

    const props = defineProps<{
        isModalOpen: boolean;
        isEdit: boolean;
        data?: {
            createdAt: string;
            description: string;
            type: string;
            amount: number;
            _id: string;
        };
    }>();

    const toast = useToast();
    const store = useDefaultStore();
    const emit = defineEmits(["update:isModalOpen", "submit"]);

    const schema = z.object({
        createdAt: z.string().min(8, "Date must be a valid date"),
        description: z.string().min(3, "Description must be at least 3 characters"),
        type: z.enum(["Income", "Expanse"], {
            message: "Type must be Income or Expanse",
        }),
        amount: z.number().min(1000, "Amount must be at least Rp 1000"),
    });

    const isOpen = computed({
        get: () => props.isModalOpen,
        set: (value: boolean) => {
            emit("update:isModalOpen", value);
        },
    });

    const formData = reactive({
        createdAt: `${new Date().toISOString().split("T")[0]}`,
        description: "",
        type: "",
        amount: 0,
        _id: "",
    });

    const formattedAmount = ref("Rp 0");

    // Fungsi yang dipanggil setiap input berubah
    const onInput = (event: InputEvent) => {
        // Hapus semua karakter non-digit

        const value = event.target.value.replace(/[^\d]/g, "");

        // Simpan nilai asli (tanpa format Rupiah)
        formData.amount = parseInt(value) || 0;

        // Format input menjadi Rupiah
        formattedAmount.value = currency(formData.amount);
    };

    const isLoading = ref(false);
    const onSubmit = async () => {
        // Validasi form
      if (isLoading.value) return;
        isLoading.value = true;

        try {
            await schema.parseAsync(formData);
            // Kirim data ke server
            if (props.isEdit && props.data) {
                formData._id = props.data?._id;
                $fetch("/api/transaction", {
                    method: "PUT",
                    body: JSON.stringify(formData),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${store.jwt}`,
                    },
                })
                    .then(() => {
                        // Tutup modal
                        toast.add({
                            title: "Success",
                            description: "Transaction saved successfully",
                        });
                        emit("submit");
                        formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
                        formData.description = "";
                        formData.type = "";
                        formData.amount = 0;
                        formattedAmount.value = "Rp 0";
                        isOpen.value = false;
                    })
                    .catch((error) => {
                        toast.add({
                            title: "Error",
                            description: error.response._data.body.message ? error.response._data.body.message : "An error occurred while trying to save the transaction",
                            color: "red",
                        });
                    });
            } else {
                $fetch("/api/transaction", {
                    method: "POST",
                    body: JSON.stringify(formData),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${store.jwt}`,
                    },
                })
                    .then(() => {
                        // Tutup modal
                        toast.add({
                            title: "Success",
                            description: "Transaction saved successfully",
                        });
                        emit("submit");
                        formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
                        formData.description = "";
                        formData.type = "";
                        formData.amount = 0;
                        formattedAmount.value = "Rp 0";
                        isOpen.value = false;
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.add({
                            title: "Error",
                            description: error.response._data.body.message ? error.response._data.body.message : "An error occurred while trying to save the transaction",
                        });
                    });
            }
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    };

    watch(
        () => props.data,
        (newValue) => {
            if (newValue) {
                formData.createdAt = newValue.createdAt.split("T")[0];
                formData.description = newValue.description;
                formData.type = newValue.type;
                formData.amount = newValue.amount;
                formData._id = newValue._id;
                formattedAmount.value = currency(newValue.amount);
            }
        },
        { immediate: true, deep: true }
    );

</script>

<template>
    <div>
        <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{
                ring: '',
                divide: 'divide-y divide-gray-100 dark:divide-gray-800',
            }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Form Transaction
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="isOpen = false" />
                    </div>
                </template>
                <div class="grid grid-cols-1 gap-4">
                    <UForm class="flex flex-col gap-4" :schema="schema" :state="formData" @submit="onSubmit">
                        <UFormGroup eager-validation label="Date" name="createdAt" required>
                            <UInput label="Date" type="date" placeholder="Date" v-model="formData.createdAt"
                                name="createdAt" />
                        </UFormGroup>
                        <UFormGroup eager-validation name="description" label="Description" required>
                            <UInput label="Description" name="description" v-model="formData.description"
                                placeholder="Description" />
                        </UFormGroup>
                        <UFormGroup eager-validation name="type" label="Type" required>
                            <USelect name="type" v-model="formData.type" label="Type" placeholder="Type of transaction"
                                :options="['Income', 'Expanse']" />
                        </UFormGroup>
                        <UFormGroup label="Amount" eager-validation name="amount" required>
                            <UInput label="Amount" v-model="formattedAmount" @keyup="onInput" type="text"
                                placeholder="Amount" name="amount" />
                        </UFormGroup>
                        <UFormGroup>
                            <UButton type="submit" color="gray" variant="solid" label="Save" />
                        </UFormGroup>
                    </UForm>
                </div>
            </UCard>
        </UModal>
    </div>
</template>