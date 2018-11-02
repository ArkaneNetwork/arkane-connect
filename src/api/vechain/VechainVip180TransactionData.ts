export interface VechainVip180TransactionClause {
    to: string;
    amount: string;
    tokenAddress: string;
}

export default class VechainVip180TransactionData {
    public type!: string;
    public walletId!: string;
    public pincode!: string;
    public submit: boolean = false;
    public blockRef?: string;
    public chainTag?: string;
    public expiration: number = 0;
    public gas!: number;
    public gasPriceCoef!: string;
    public nonce?: string;
    public clauses: VechainVip180TransactionClause[] = [];
}
