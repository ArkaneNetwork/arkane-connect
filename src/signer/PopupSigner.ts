import { ConfirmationRequest }              from '../models/ConfirmationRequest';
import { RequestDataType }                  from '../models/RequestDataType';
import { BuildTransactionRequest }          from '../models/transaction/build/BuildTransactionRequest';
import { BuildSimpleTransactionRequest }    from '../models/transaction/build/BuildSimpleTransactionRequest';
import { BuildTokenTransferRequest }        from '../models/transaction/build/BuildTokenTransferRequest';
import { BuildNftTransferRequest }          from '../models/transaction/build/BuildNftTransferRequest';
import { BuildGasTransferRequest }          from '../models/transaction/build/BuildGasTransferRequest';
import { BuildTransferRequestDto }          from '../models/transaction/build/BuildTransferRequestDto';
import { BuildTokenTransferRequestDto }     from '../models/transaction/build/BuildTokenTransferRequestDto';
import { BuildNftTransferRequestDto }       from '../models/transaction/build/BuildNftTransferRequestDto';
import { BuildGasTransferRequestDto }       from '../models/transaction/build/BuildGasTransferRequestDto';
import { BuildGenericTransferRequestDto }   from '../models/transaction/build/BuildGenericTransferRequestDto';
import { BuildContractExecutionRequestDto } from '../models/transaction/build/BuildContractExecutionRequestDto';
import { BuildContractExecutionRequest }    from '../models/transaction/build/BuildContractExecutionRequest';
import { GenericSignatureRequest }          from '../models/transaction/GenericSignatureRequest';
import { TransactionRequest }               from '../models/transaction/TransactionRequest';
import Popup, { PopupOptions }              from '../popup/Popup';
import { Signer, SignerResult }             from './Signer';
import { EventTypes }                       from '../types/EventTypes';
import Utils                                from '../utils/Utils';
import { BuildMessageSignRequestDto }       from '../models/transaction/build/BuildMessageSignRequestDto';
import { BuildMessageSignRequest }          from '../models/transaction/build/BuildMessageSignRequest';
import { BuildEip712SignRequestDto }        from '../models/transaction/build/BuildEip712SignRequestDto';
import { BuildEip712SignRequest }           from '../models/transaction/build/BuildEip712SignRequest';
import { ImportWalletRequest }              from '../models/wallet/ImportWalletRequest';
import { DialogWindow }                     from '../dialog/DialogWindow';

export class PopupSigner implements Signer {

    private popup?: PopupSignerPopup;
    private bearerTokenProvider: () => string;
    private options?: PopupOptions;
    private clientId: string;

    constructor(bearerTokenProvider: () => string, clientId: string, options?: PopupOptions) {
        this.bearerTokenProvider = bearerTokenProvider;
        this.options = options;
        this.clientId = clientId;
    }

    public openPopup() {
        this.popup = new PopupSignerPopup(`${Utils.urls.connect}/popup/transaction/init.html`, this.bearerTokenProvider, this.options);
        window.addEventListener('beforeunload', () => {
            this.closePopup();
        });
    }

    public closePopup() {
        if (this.popup)
            this.popup.close();
    }

    public isOpen(): boolean {
        if (this.popup)
            return this.popup.isOpen();
        else
            return false;
    }

    public async sign(signatureRequest: GenericSignatureRequest): Promise<SignerResult> {
        signatureRequest.hash = typeof signatureRequest.hash === 'undefined' ? true : signatureRequest.hash;
        signatureRequest.prefix = typeof signatureRequest.hash === 'undefined' ? true : signatureRequest.prefix;
        return this.signRequest(signatureRequest);
    }

    public async signMessage(buildDate: BuildMessageSignRequestDto): Promise<SignerResult> {
        return this.signData(BuildMessageSignRequest.fromData(buildDate));
    }

    public async signEip712(buildDate: BuildEip712SignRequestDto): Promise<SignerResult> {
        return this.signData(BuildEip712SignRequest.fromData(buildDate));
    }

    /** Deprecated since 1.1.9. Use sign instead */
    public async signTransaction(signatureRequest: GenericSignatureRequest): Promise<SignerResult> {
        return this.sign(signatureRequest);
    }

    public async executeNativeTransaction(transactionRequest: TransactionRequest): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'execute-transaction').then(() => {
            return this.handleRequest(`execute/${transactionRequest.type}`, transactionRequest);
        });
    }

    /** Deprecated since 1.4.0. Use transfer functions instead */
    public async executeTransaction(genericTransactionRequestOrTransactionId: BuildGenericTransferRequestDto | string): Promise<SignerResult> {
        if (typeof genericTransactionRequestOrTransactionId === 'string') {
            return this.execute({transactionId: genericTransactionRequestOrTransactionId});
        } else {
            return this.execute(BuildTransactionRequest.fromData(genericTransactionRequestOrTransactionId));
        }
    }

    public executeTransfer(buildTransactionData: BuildTransferRequestDto): Promise<SignerResult> {
        return this.execute(BuildSimpleTransactionRequest.fromData(buildTransactionData));
    }

    public executeTokenTransfer(buildTransactionData: BuildTokenTransferRequestDto): Promise<SignerResult> {
        return this.execute(BuildTokenTransferRequest.fromData(buildTransactionData));
    }

    public executeNftTransfer(buildTransactionData: BuildNftTransferRequestDto): Promise<SignerResult> {
        return this.execute(BuildNftTransferRequest.fromData(buildTransactionData));
    }

    public executeGasTransfer(buildTransactionData: BuildGasTransferRequestDto): Promise<SignerResult> {
        return this.execute(BuildGasTransferRequest.fromData(buildTransactionData));
    }

    public executeContract(buildTransactionData: BuildContractExecutionRequestDto): Promise<SignerResult> {
        return this.execute(BuildContractExecutionRequest.fromData(buildTransactionData));
    }

    public executeSavedTransaction(transactionId: string): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'execute-transaction').then(() => {
            return this.handleRequest(`execute/${transactionId}`, {});
        });
    }

    public resubmitTransaction(transactionId: string): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'execute-transaction').then(() => {
            return this.handleRequest('resubmit', {transactionId});
        });
    }

    public cancelTransaction(transactionId: string): Promise<SignerResult> {
        return this.handleRequest('cancel', {transactionId});
    }

    public async importWallet(request: ImportWalletRequest): Promise<SignerResult> {
        return this.confirm(ImportWalletRequest.fromData(request));
    }

    public async confirm(request: ConfirmationRequest): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'import-wallet').then(() => {
            return this.handleRequest('confirm', request);
        });
    }

    private async execute(requestData: RequestDataType): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'execute-transaction').then(() => {
            return this.handleRequest('execute', requestData);
        });
    }

    private async signData(requestData: RequestDataType): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'sign-data').then(() => {
            return this.handleRequest('sign', requestData);
        });
    }

    private async signRequest(requestData: RequestDataType): Promise<SignerResult> {
        return DialogWindow.openActionDialog(this.clientId, 'sign-transaction').then(() => {
            return this.handleRequest('sign', requestData);
        });
    }

    private async handleRequest(action: string,
                                requestData: RequestDataType): Promise<SignerResult> {
        this.openPopup();
        this.popup!.focus();
        return this.popup!
                   .sendData(action, Object.assign({}, requestData))
                   .finally(() => {
                       this.closePopup()
                   });
    }
}

class PopupSignerPopup extends Popup {

    protected finishedEventType = EventTypes.SIGNER_FINISHED;
    protected sendDataEventType = EventTypes.SEND_TRANSACTION_DATA;

    constructor(url: string,
                bearerTokenProvider: () => string,
                options?: PopupOptions) {
        super(url, bearerTokenProvider, options);
    }

    public sendData(
        action: string,
        requestData: RequestDataType
    ): Promise<SignerResult> {
        return new Promise((resolve: (value?: SignerResult | PromiseLike<SignerResult>) => void,
                            reject: (reason?: any) => void) => {
            this.onPopupMountedQueue.push(this.attachFinishedListener(resolve, reject));
            this.onPopupMountedQueue.push(this.sendDataToPopup(action, requestData));
            this.processPopupMountedQueue();
        }) as Promise<SignerResult>;
    }

    protected sendDataToPopup(
        action: string,
        requestData: RequestDataType
    ): () => void {
        return () => {
            if (this.isOpen()) {
                this.popupWindow.postMessage(
                    {type: this.sendDataEventType, params: {action, transactionRequest: requestData, bearerToken: this.bearerTokenProvider()}},
                    Utils.urls.connect
                );
            }
        };
    }
}
