/* tslint:disable */
/// <reference path="./typings.d.ts" />
/* tslint:enable */
import { AxiosResponse }                     from 'axios';
import RestApi, { RestApiResponse }          from '../../api/RestApi';
import { Wallet }                            from '../../models/Wallet';
import Utils                                 from '../../utils/Utils';
import { Profile }                           from '../../models/Profile';
import Security, { LoginResult }             from '../../Security';
import { KeycloakInstance, KeycloakPromise } from 'keycloak-js';
import { GenericTransactionRequest }         from '../../api/model/GenericTransactionRequest';
import * as QueryString                      from 'querystring';

export class ArkaneConnect {

    public static addRequestParams(url: string, params: { [key: string]: string }): string {
        if (url && params) {
            const paramsAsString = QueryString.stringify(params);
            if (url && url.indexOf('?') > 0) {
                return `${url}&${paramsAsString}`;
            } else {
                return `${url}?${paramsAsString}`;
            }
        }
        return url;
    }

    private api!: RestApi;
    private clientId: string;
    private chains: string[];
    private bearerTokenProvider: any;

    private auth!: KeycloakInstance;

    constructor(clientId: string, options?: ConstructorOptions) {
        this.clientId = clientId;
        this.chains = (options && options.chains || []).map((chain: string) => chain.toLowerCase());
        Utils.environment = options && options.environment || 'prod';
    }

    public checkAuthenticated(options?: AuthenticationOptions): Promise<AuthenticationResult> {
        return Security.checkAuthenticated(this.clientId, options && options.redirectUri)
                       .then((loginResult: LoginResult) => this.afterAuthentication(loginResult));
    }

    public authenticate(options?: AuthenticationOptions): Promise<AuthenticationResult> {
        return Security.login(this.clientId, options && options.redirectUri)
                       .then((loginResult: LoginResult) => this.afterAuthentication(loginResult));
    }

    public logout(): KeycloakPromise<void, void> {
        return this.auth.logout();
    }

    public addOnTokenRefreshCallback(tokenRefreshCallback?: (token: string) => void): void {
        if (tokenRefreshCallback) {
            Security.onTokenUpdate = tokenRefreshCallback;
        }
    }

    public async init(bearerTokenProvider?: any): Promise<void> {
        if (bearerTokenProvider) {
            this.bearerTokenProvider = bearerTokenProvider;
        } else {
            this.bearerTokenProvider = () => this.auth.token;
        }

        if (this.bearerTokenProvider) {
            this.api = new RestApi(Utils.urls.api, this.bearerTokenProvider);
            if (this.chains && this.chains.length > 0) {
                const wallets = await this.getWallets();
                const mandatoryWallets = wallets && wallets.length > 0 && this.filterOnMandatoryWallets(wallets);
                if (!(mandatoryWallets && mandatoryWallets.length > 0)) {
                    this.manageWallets();
                }
            }
        }
    }

    public manageWallets(options?: { redirectUri?: string, correlationID?: string }) {
        this.postInForm(`${Utils.urls.connectWeb}/wallets/manage${Utils.environment ? '?environment=' + Utils.environment : ''}`, {chain: this.chains[0]}, options);
    }

    public linkWallets(options?: { redirectUri?: string, correlationID?: string }) {
        this.postInForm(`${Utils.urls.connectWeb}/wallets/link${Utils.environment ? '?environment=' + Utils.environment : ''}`, {}, options);
    }

    public async getWallets(): Promise<Wallet[]> {
        const response: AxiosResponse<RestApiResponse<Wallet[]>> = await this.api.http.get('wallets');
        if (response && response.data && response.data.success) {
            return response.data.result;
        } else {
            return [];
        }
    }

    public async getProfile(): Promise<Profile> {
        const response: AxiosResponse<RestApiResponse<Profile>> = await this.api.http.get('profile');
        if (response && response.data && response.data.success) {
            return response.data.result;
        } else {
            return new Profile();
        }
    }

    public async buildTransactionRequest(genericTransactionRequest: GenericTransactionRequest): Promise<any> {
        const response: AxiosResponse<RestApiResponse<any>> = await this.api.http.post('transactions/build', genericTransactionRequest);
        if (response && response.data && response.data.success) {
            return response.data.result;
        }
    }

    public async executeTransaction(genericTransactionRequest: GenericTransactionRequest, options?: { redirectUri?: string, correlationID?: string }): Promise<void> {
        this.postInForm(
            `${Utils.urls.connectWeb}/transaction/execute`,
            genericTransactionRequest,
            options,
        );
    }

    public executeNativeTransaction(transactionRequest: any, options?: { redirectUri?: string, correlationID?: string }): void {
        this.postInForm(
            `${Utils.urls.connectWeb}/transaction/execute/${transactionRequest.type}`,
            transactionRequest,
            options,
        );
    }

    public signTransaction(transactionRequest: any, options?: { redirectUri?: string, correlationID?: string }): void {
        this.postInForm(
            `${Utils.urls.connectWeb}/transaction/sign/${transactionRequest.type}`,
            transactionRequest,
            options,
        );
    }

    private postInForm(to: string, data: any, options?: { redirectUri?: string, correlationID?: string }): void {
        const form = document.createElement('form');
        form.action = this.buildUrl(to, options);
        form.method = 'POST';

        const inputBearer = document.createElement('input');
        inputBearer.type = 'hidden';
        inputBearer.name = 'bearerToken';
        inputBearer.value = this.bearerTokenProvider();
        form.appendChild(inputBearer);

        const inputData = document.createElement('input');
        inputData.type = 'hidden';
        inputData.name = 'data';
        inputData.value = JSON.stringify({...data});
        form.appendChild(inputData);

        document.body.appendChild(form);
        form.submit();
    }

    private buildUrl(to: string, options?: { redirectUri?: string; correlationID?: string }) {
        if (options) {
            const params: { [key: string]: string } = {};
            if (options.redirectUri) {
                params.redirectUri = options.redirectUri;
            }
            if (options.correlationID) {
                params.cid = options.correlationID;
            }
            return ArkaneConnect.addRequestParams(to, params);
        }
        return to;
    }

    private filterOnMandatoryWallets(wallets: Wallet[]): Wallet[] {
        return wallets.filter(
            (wallet: Wallet) => this.chains.find(
                (chain: string) => (wallet.secretType as string).toLowerCase() === chain,
            ) !== undefined,
        );
    }

    private async afterAuthentication(loginResult: LoginResult): Promise<AuthenticationResult> {
        this.auth = loginResult.keycloak;
        if (loginResult.authenticated) {
            await this.init();
        }
        return {
            authenticated(this: AuthenticationResult, callback: (auth: KeycloakInstance) => void) {
                if (loginResult.authenticated) {
                    callback(loginResult.keycloak);
                }
                return this;

            },
            notAuthenticated(this: AuthenticationResult, callback: (auth: KeycloakInstance) => void) {
                if (!loginResult.authenticated) {
                    callback(loginResult.keycloak);
                }
                return this;
            },
        };
    }
}

export interface AuthenticationResult {
    authenticated: (onAuthenticated: (auth: KeycloakInstance) => void) => AuthenticationResult;
    notAuthenticated: (onNotAuthenticated: (auth: KeycloakInstance) => void) => AuthenticationResult;
}

export interface ConstructorOptions {
    chains?: string[];
    environment?: string;
}

export interface AuthenticationOptions {
    redirectUri?: string;
}

if (typeof window !== 'undefined') {
    (window as any).ArkaneConnect = ArkaneConnect;
}
