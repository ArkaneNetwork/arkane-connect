/* tslint:disable */
/// <reference path="./typings.d.ts" />
/* tslint:enable */
import {AxiosResponse} from 'axios';
import RestApi, {RestApiResponse} from '../../api/RestApi';
import {Wallet} from '../../models/Wallet';
import Utils from '../../utils/Utils';
import {Profile} from '../../models/Profile';
import Security, {LoginResult} from '../../Security';
import {KeycloakInstance, KeycloakPromise} from 'keycloak-js';
import {GenericTransactionRequest} from '../../models/GenericTransactionRequest';
import {Signer} from './signer';

export class ArkaneConnect {

    private api!: RestApi;
    private clientId: string;
    private chains: string[];
    private bearerTokenProvider: any;

    private auth!: KeycloakInstance;

    constructor(clientId: string, chains?: string[], environment?: string) {
        this.clientId = clientId;
        this.chains = (chains || []).map((chain: string) => chain.toLowerCase());
        Utils.environment = environment || 'prod';
        this.addBeforeUnloadListener();
    }

    public checkAuthenticated(): Promise<AuthenticationResult> {
        return Security.checkAuthenticated(this.clientId)
                       .then((loginResult: LoginResult) => this.afterAuthentication(loginResult));
    }

    public authenticate(): Promise<AuthenticationResult> {
        return Security.login(this.clientId)
                       .then((loginResult: LoginResult) => this.afterAuthentication(loginResult));
    }

    public async afterAuthentication(loginResult: LoginResult): Promise<AuthenticationResult> {
        this.auth = loginResult.keycloak;
        return this.init()
                   .then(() => {
                       return {
                           authenticated(this: AuthenticationResult, callback: (auth: KeycloakInstance) => void) {
                               callback(loginResult.keycloak);
                               return this;
                           },
                           notAuthenticated(this: AuthenticationResult, callback: (auth: KeycloakInstance) => void) {
                               callback(loginResult.keycloak);
                               return this;
                           },
                       };
                   });
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
            const wallets = await this.getWallets();
            const mandatoryWallets = wallets && wallets.length > 0 && this.filterOnMandatoryWallets(wallets);
            if (!(mandatoryWallets && mandatoryWallets.length > 0)) {
                const currentLocation = window.location;
                const redirectUri = encodeURIComponent(currentLocation.origin + currentLocation.pathname + currentLocation.search);
                window.location.href =
                    `${Utils.urls.connect}/wallets/manage/${this.chains[0]}?bearerToken=${this.bearerTokenProvider()}&redirectUri=${redirectUri}` +
                    `${Utils.environment ? '&environment=' + Utils.environment : ''}`;
            }
        }
    }

    public manageWallets() {
        const currentLocation = window.location;
        const redirectUri = encodeURIComponent(currentLocation.origin + currentLocation.pathname + currentLocation.search);
        window.location.href =
            `${Utils.urls.connect}/wallets/manage/${this.chains[0]}?bearerToken=${this.bearerTokenProvider()}&redirectUri=${redirectUri}` +
            `${Utils.environment ? '&environment=' + Utils.environment : ''}`;
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

    public createSigner() {
        return Signer.createSigner(this.bearerTokenProvider);
    }

    public destroySigner() {
        Signer.destroySigner();
    }

    private addBeforeUnloadListener() {
        window.addEventListener('beforeunload', () => {
            this.destroySigner();
        });
    }

    private filterOnMandatoryWallets(wallets: Wallet[]) {
        return wallets.filter(
            (wallet: Wallet) => this.chains.find(
                (chain: string) => (wallet.secretType as string).toLowerCase() === chain,
            ) !== undefined,
        );
    }
}

export interface AuthenticationResult {
    authenticated: (onAuthenticated: (auth: KeycloakInstance) => void) => AuthenticationResult;
    notAuthenticated: (onNotAuthenticated: (auth: KeycloakInstance) => void) => AuthenticationResult;
}

if (typeof window !== 'undefined') {
    (window as any).ArkaneConnect = ArkaneConnect;
}
