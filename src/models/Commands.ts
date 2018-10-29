import {SecretType} from './SecretType';
import {ImportWalletType} from '@/models/ImportWalletType';

export interface CreateWalletCommand {
    alias?: string;
    pincode?: string;
    description?: string;
    primary?: boolean;
    hasCustomPin?: boolean;
    secretType: SecretType;
    clients?: string[];
}

export interface LinkWalletCommand {
    client: string;
    walletIds: string[];
}

export interface ImportKeystoreCommand {
    importWalletType: ImportWalletType;
    pincode: string;
    keystore: string;
    password: string;
}

export interface ImportPrivateKeyCommand {
    importWalletType: ImportWalletType;
    pincode: string;
    privateKey: string;
}
