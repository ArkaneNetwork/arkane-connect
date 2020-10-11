import { SecretType }                  from '../../SecretType';
import { Network }                     from '../../Network';
import { BuildTransactionRequestType } from './BuildTransactionRequestType';
import { BuildTransferRequestBase }    from './BuildTransferRequestBase';
import { BuildNftTransferRequestDto }  from './BuildNftTransferRequestDto';

export class BuildNftTransferRequest extends BuildTransferRequestBase implements BuildNftTransferRequestDto {
    public tokenAddress!: string;
    public tokenId!: string;
    public from?: string;

    public static fromData(requestData: BuildNftTransferRequestDto): BuildNftTransferRequest {
        const {walletId, to, secretType, tokenAddress, tokenId, from, alias, network} = requestData;
        return new this(walletId, to, secretType, tokenAddress, tokenId, from, alias, network);
    }

    constructor(walletId: string, to: string, secretType: SecretType, tokenAddress: string, tokenId: string, from?: string, alias?: string, network?: Network) {
        super(BuildTransactionRequestType.NFT_TRANSFER, walletId, to, secretType, alias, network);
        this.tokenAddress = tokenAddress;
        this.tokenId = tokenId;
        from ? this.from = from : undefined;
    }
}