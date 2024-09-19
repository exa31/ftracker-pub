interface Transaction {
    type: string
    amount: number
    description: string
    createdAt: string
    _id: string
    updatedAt: string
}

export default function useLastTotal(data: Transaction[]) {
    const total = computed(() => {
        return data.reduce((acc, curr) => {
            return acc + curr.amount;
        }, 0);
    });
    return { total };
};