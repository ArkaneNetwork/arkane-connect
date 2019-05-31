import { KeycloakInitOptions, KeycloakInstance } from 'keycloak-js';
import QueryString                               from 'querystring';
import { AuthenticationOptions }                 from './connect';
import { PopupUtils }                            from '../popup/PopupUtils';
import { WindowMode }                            from '../models/WindowMode';
import { EventTypes }                            from '../types/EventTypes';
import Utils                                     from '../utils/Utils';

export class Security {

    public static onTokenUpdate: (token: string) => void;

    public static getConfig(clientId?: string): any {
        return {
            'clientId': clientId || Utils.env.CONNECT_JS_CLIENT_ID,
            'realm': Utils.env.CONNECT_JS_REALM,
            'url': Utils.urls.login,
            'ssl-required': Utils.env.CONNECT_JS_SSL_REQUIRED,
            'public-client': Utils.env.CONNECT_JS_PUBLIC_CLIENT,
        };
    }

    public static login(clientId: string, options?: AuthenticationOptions): Promise<LoginResult> {
        switch (options && options.windowMode) {
            case WindowMode.POPUP:
                return Security.loginPopup(clientId, options);
            // case WindowMode.IFRAME:
            //     return Security.initLoginIFrame(clientId, options && options.iFrameSelector || '#login-iframe');
            default:
                return Security.loginRedirect(clientId, options);
        }
    }

    // public static initLoginIFrame(clientId: string, iFrameSelector: string) {
    //     return new Promise(async (resolve: (value?: LoginResult | PromiseLike<LoginResult>) => void, reject: (reason?: any) => void) => {
    //         Security.loginListener = await Security.createLoginListener(clientId, EventTypes.AUTHENTICATE, resolve, reject);
    //         window.addEventListener('message', Security.loginListener);
    //         Security.initialiseLoginIFrame(clientId, iFrameSelector);
    //     }) as Promise<LoginResult>;
    // }

    private static loginRedirect(clientId: string, options?: AuthenticationOptions): Promise<LoginResult> {
        return Security.initializeAuth(Security.getConfig(clientId), 'login-required', options);
    }

    private static loginPopup(clientId: string, options?: AuthenticationOptions): Promise<LoginResult> {
        return new Promise(async (resolve: (value?: LoginResult | PromiseLike<LoginResult>) => void, reject: (reason?: any) => void) => {
            let closePopup = options ? options.closePopup : true;
            Security.loginListener = await Security.createLoginListener(clientId, EventTypes.AUTHENTICATE, resolve, reject, closePopup);
            window.addEventListener('message', Security.loginListener);
            Security.initialiseLoginPopup(clientId, resolve);
        }) as Promise<LoginResult>;
    }

    public static checkAuthenticated(clientId: string): Promise<LoginResult> {
        return new Promise(async (resolve: (value: LoginResult) => void, reject: (reason?: any) => void) => {
            Security.checkAuthenticatedListener = await Security.createLoginListener(clientId, EventTypes.CHECK_AUTHENTICATED, resolve, reject);
            window.addEventListener('message', Security.checkAuthenticatedListener);
            Security.initialiseCheckAuthenticatedIFrame(clientId);
        });
    }

    public static logout(auth: Keycloak.KeycloakInstance): Promise<void> {
        if (auth.authenticated && auth.clientId) {
            return new Promise<void>(async (resolve: () => void, reject: (reason?: any) => void) => {
                if (auth.clientId) {
                    Security.logoutListener = await Security.createLogoutListener(EventTypes.LOGOUT, auth, resolve, reject);
                    window.addEventListener('message', Security.logoutListener);
                    Security.initialiseLogoutIFrame(auth.clientId);
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    private static keycloak: KeycloakInstance;

    private static updateTokenInterval: any;
    private static loginListener: any;
    private static popupWindow: Window;
    private static checkAuthenticatedListener: any;
    private static logoutListener: any;
    private static isLoginPopupClosedInterval?: any;

    private static readonly AUTH_IFRAME_ID = 'arkane-auth-iframe';
    private static readonly LOGOUT_IFRAME_ID = 'arkane-logout-iframe';

    private static get checkAuthenticatedURI() {
        return `${Utils.urls.connect}/checkAuthenticated`;
    }

    private static get authenticateURI() {
        return `${Utils.urls.connect}/authenticate`;
    }

    private static get logoutURI() {
        return `${Utils.urls.connect}/logout`;
    }

    private static createLoginListener = async function(clientId: string, eventType: EventTypes, resolve: (value: LoginResult) => void, reject: any, closePopup?: boolean) {
        return async (message: MessageEvent) => {
            if (message && message.origin === Utils.urls.connect && message.data && message.data.type === eventType) {
                if (Security.isLoginPopupClosedInterval) {
                    Security.clearIsLoginPopupClosedInterval();
                }
                if (message.data.authenticated) {
                    try {
                        Security.cleanUp(eventType, closePopup);
                        const keycloakResult = message.data.keycloak;
                        const initOptions: KeycloakInitOptions = {
                            onLoad: 'check-sso',
                            token: keycloakResult.token,
                            refreshToken: keycloakResult.refreshToken,
                            idToken: keycloakResult.idToken,
                            timeSkew: keycloakResult.timeSkew,
                            checkLoginIframe: false,
                        };
                        // Remove the login state from the URL when tokens are already present (the checkAuthenticated iframe already handled it)
                        Security.removeLoginState();
                        const loginResult = await Security.initKeycloak(Security.getConfig(clientId), initOptions);
                        resolve({
                            keycloak: loginResult.keycloak,
                            authenticated: loginResult.authenticated,
                            popupWindow: Security.popupWindow
                        })
                    } catch (e) {
                        reject({error: e});
                    }
                } else {
                    resolve({authenticated: false});
                }
            }
        }
    };


    private static createLogoutListener = async function(eventType: EventTypes, auth: Keycloak.KeycloakInstance, resolve: () => void, reject: any) {
        return (message: MessageEvent) => {
            if (message && message.origin === Utils.urls.connect && message.data && message.data.type === eventType) {
                if (auth.authenticated) {
                    if (!message.data.authenticated) {
                        auth.onAuthLogout && auth.onAuthLogout();
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    resolve();
                }
            }
        }
    };

    private static initialiseLoginPopup(clientId: string, resolve: (value: LoginResult) => void): void {
        const origin = window.location.href.replace(window.location.search, '');
        const url = `${Security.authenticateURI}?${QueryString.stringify({clientId: clientId, origin: origin, env: Utils.rawEnvironment})}`;
        Security.popupWindow = PopupUtils.openWindow(url);
        Security.initialiseIsLoginPopupClosedInterval(resolve);
    }

    private static initialiseIsLoginPopupClosedInterval(resolve: (value: LoginResult) => void) {
        Security.isLoginPopupClosedInterval = window.setInterval(() => {
            if (Security.popupWindow.closed) {
                this.clearIsLoginPopupClosedInterval();
                this.cleanUp(EventTypes.AUTHENTICATE);
                resolve({authenticated: false});
            }
        }, 2000);
    }

    private static clearIsLoginPopupClosedInterval() {
        clearInterval(Security.isLoginPopupClosedInterval);
        delete Security.isLoginPopupClosedInterval;
    }

    // private static initialiseLoginIFrame(clientId: string, iframeSelector: string): HTMLIFrameElement {
    //     const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement;
    //     const origin = window.location.href.replace(window.location.search, '');
    //     iframe.src = `${Security.authenticateURI}?${QueryString.stringify({clientId: clientId, origin: origin, env: Utils.rawEnvironment})}`;
    //     return iframe;
    // }

    private static initialiseCheckAuthenticatedIFrame(clientId: string): HTMLIFrameElement {
        return this.initialiseIFrame(clientId, Security.AUTH_IFRAME_ID, Security.checkAuthenticatedURI);
    }

    private static initialiseLogoutIFrame(clientId: string): HTMLIFrameElement {
        return this.initialiseIFrame(clientId, Security.LOGOUT_IFRAME_ID, Security.logoutURI);
    }

    private static initialiseIFrame(clientId: string, iframeID: string, uri: string): HTMLIFrameElement {
        let iframe = document.getElementById(iframeID) as HTMLIFrameElement;
        let isIframeInBody = true;
        if (!iframe) {
            isIframeInBody = false;
            iframe = document.createElement('iframe') as HTMLIFrameElement;
        }

        const origin = window.location.href.replace(window.location.search, '');
        iframe.src = `${uri}?${QueryString.stringify({clientId: clientId, origin: origin, env: Utils.rawEnvironment})}`;
        iframe.hidden = true;
        iframe.id = iframeID;
        document.body.appendChild(iframe);
        if (!isIframeInBody) {
            document.body.appendChild(iframe);
        }
        return iframe;
    }

    private static setUpdateTokenInterval() {
        if (Security.updateTokenInterval) {
            clearInterval(Security.updateTokenInterval);
            Security.updateTokenInterval = null;
        }
        Security.updateTokenInterval = setInterval(
            async () => {
                new Promise((resolve, reject) => {
                    if (Security.keycloak) {
                        Security.keycloak.updateToken(70).success((refreshed: any) => {
                            resolve(refreshed);
                        });
                    } else {
                        reject(false);
                    }
                }).then((refreshed: any) => {
                    if (refreshed) {
                        if (Security.onTokenUpdate && Security.keycloak.token) {
                            Security.onTokenUpdate(Security.keycloak.token);
                        }
                    }
                }).catch(() => {
                    (console as any).error('failed to refresh token');
                    clearInterval(Security.updateTokenInterval);
                    Security.updateTokenInterval = null;
                });
            },
            60000,
        );
    }

    private static async initializeAuth(config: any, onLoad: 'check-sso' | 'login-required', options?: AuthenticationOptions): Promise<LoginResult> {
        const initOptions: KeycloakInitOptions = {
            onLoad,
        };
        if (options && options.redirectUri) {
            Object.assign(initOptions, {redirectUri: options.redirectUri});
        }
        return Security.initKeycloak(config, initOptions);
    }

    private static async initKeycloak(config: any, initOptions: Keycloak.KeycloakInitOptions): Promise<LoginResult> {
        const Keycloak: { default: (config?: string | {} | undefined) => KeycloakInstance } = await import ('keycloak-js');
        Security.keycloak = Keycloak.default(config);
        return new Promise((resolve, reject) => {
            Security.keycloak
                    .init(initOptions)
                    .success((authenticated: any) => {
                        if (authenticated) {
                            Security.setUpdateTokenInterval();
                        }
                        resolve({
                            keycloak: Security.keycloak,
                            authenticated,
                        } as LoginResult);
                    })
                    .error((e) => {
                        reject(e);
                    });
        });
    }

    private static removeLoginState(): void {
        const url = window.location.href;
        const fragmentIndex = url.indexOf('#');
        if (fragmentIndex !== -1) {
            const newURL = url.substring(0, fragmentIndex);
            window.history.replaceState({}, '', newURL);
        }
    }

    private static cleanUp(eventType: EventTypes, closePopup: boolean = true) {
        if (eventType === EventTypes.CHECK_AUTHENTICATED) {
            if (Security.checkAuthenticatedListener) {
                window.removeEventListener('message', Security.checkAuthenticatedListener);
                delete Security.checkAuthenticatedListener;
            }
            const iframe = document.getElementById(Security.AUTH_IFRAME_ID);
            if (iframe) {
                iframe.remove();
            }
        } else if (eventType === EventTypes.AUTHENTICATE) {
            if (Security.loginListener) {
                window.removeEventListener('message', Security.loginListener);
                delete Security.loginListener;
            }
            if (closePopup && Security.popupWindow && !Security.popupWindow.closed) {
                Security.popupWindow.close();
            }
        }

    }
}

export interface LoginResult {
    keycloak?: KeycloakInstance;
    authenticated: boolean;
    popupWindow?: Window;
}
