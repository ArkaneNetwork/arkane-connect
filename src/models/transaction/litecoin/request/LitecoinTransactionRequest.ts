import { TransactionRequest } from '../../TransactionRequest';

export class LitecoinTransactionRequest extends TransactionRequest {
    public value!: number;
    public to!: string;
    public feePerByte?: number;
}
