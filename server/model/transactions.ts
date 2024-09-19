import { Schema, model, Document } from 'mongoose';


export interface Transaction extends Document {
    user: string | Schema.Types.ObjectId;
    amount: number;
    type: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<Transaction>({
    user: { type: Schema.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },

}, { timestamps: true });

export default model<Transaction>('Transaction', transactionSchema);

