import { SecretType }                  from '../../SecretType';
import { Network }                     from '../../Network';
import { BuildTransactionRequestType } from './BuildTransactionRequestType';
import { BuildTransferRequestBaseDto } from './BuildTransferRequestBaseDto';

export abstract class BuildTransferRequestBase implements BuildTransferRequestBaseDto {
    public walletId!: string;
    public to!: string;
    public secretType!: SecretType;
    public alias?: string;
    public network?: Network;

    private type: BuildTransactionRequestType;

    constructor(type: BuildTransactionRequestType, walletId: string, to: string, secretType: SecretType, alias?: string, network?: Network) {
        this.type = type;
        this.walletId = walletId;
        this.to = to;
        this.secretType = secretType;
        alias ? this.alias = alias : undefined;
        network ? this.network = network : undefined;
    }
}