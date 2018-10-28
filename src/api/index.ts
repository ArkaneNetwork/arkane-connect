// this is aliased in webpack config based on server/client build
import {AxiosError, AxiosResponse} from 'axios';
import RestApi, {RestApiResponse} from './RestApi';
import ResponseBody from './ResponseBody';
import Utils from '../utils/Utils';
import {Wallet} from '../models/Wallet';
import {CreateWalletCommand, LinkWalletCommand} from '../models/Commands';
import {Profile} from '../models/Profile';
import {Balance} from '../models/Balance';
import {SecretType} from '../models/SecretType';

export default class Api {
    public static token: string = '';

    public static signTransaction(data: any, pincode: string): Promise<ResponseBody> {
        return this.handleTransaction('signatures', data, pincode);
    }

    public static executeTransaction(data: any, pincode: string): Promise<ResponseBody> {
        return this.handleTransaction('transactions', data, pincode);
    }

    public static handleTransaction(endpoint: string, data: any, pincode: string): Promise<ResponseBody> {

        return Api.getApi().http
                  .post(endpoint, Utils.removeNulls(Object.assign(data, {pincode})))
                  .then((axiosRes: AxiosResponse) => {
                      return axiosRes.data as ResponseBody;
                  })
                  .catch((error: AxiosError) => {
                      let response;
                      if (error.response) {
                          response = error.response.data;
                      } else {
                          response = 'unknown js error';
                      }
                      return {
                          success: false,
                          result: response,
                      };
                  });
    }

    public static getWallets(filter?: { secretType?: SecretType, clientId?: string }): Promise<Wallet[]> {
        filter = (filter && Utils.removeNulls(filter)) || {};
        return Api.getApi().http
                  .get('wallets', { params: filter})
                  .then((result: any) => {
                      return result.data && result.data.success ? result.data.result : [];
                  })
                  .catch(() => {
                      return [];
                  });
    }

    public static getWallet(walletId: string): Promise<Wallet> {
        return Api.getApi().http
                  .get(`wallets/${walletId}`)
                  .then((result: any) => {
                      return result.data && result.data.success ? result.data.result : {};
                  });
    }

    public static getBalance(walletId: string): Promise<Balance> {
        return Api.getApi().http
                  .get(`wallets/${walletId}/balance`)
                  .then((result: any) => {
                      return result.data && result.data.success ? result.data.result : [];
                  })
                  .catch(() => {
                      return {
                          success: false,
                          result: {},
                      };
                  });
    }

    public static getProfile(): Promise<Profile> {
        return Api.getApi().http
                  .get('profile')
                  .then((result: any) => {
                      return result.data && result.data.success ? result.data.result : new Profile();
                  })
                  .catch(() => {
                      return new Profile();
                  });
    }

    public static async setMasterPin(newPin: string, oldPin?: string): Promise<boolean> {
        return Api.getApi().http
                  .patch('profile', Utils.removeNulls({pincode: oldPin, newPincode: newPin}))
                  .then((res: AxiosResponse<RestApiResponse<any>>) => {
                      return res && res.data && res.data.success;
                  });
    }

    public static createWallet(command: CreateWalletCommand): Promise<RestApiResponse<Wallet>> {
        return Api.getApi().http
                  .post('wallets', command)
                  .then((res: AxiosResponse<RestApiResponse<Wallet>>) => {
                          return res.data;
                      },
                  );
    }

    public static async linkWallet(command: LinkWalletCommand, override: boolean = false): Promise<ResponseBody> {
        return Api.getApi().http
                  .post(`wallets/link?override=${override}`, Utils.removeNulls(command))
                  .then((axiosRes: AxiosResponse) => {
                      return {
                          success: true,
                          result: {},
                      };
                  })
                  .catch((e: Error) => {
                      return {
                          success: false,
                          result: {},
                      };
                  });
    }

    private static instance: Api;

    private static getInstance(): Api {
        if (!Api.instance) {
            Api.instance = new Api();
        }

        return Api.instance;
    }

    private static getApi(): RestApi {
        return Api.getInstance().api;
    }

    private api: RestApi;

    public constructor() {
        this.api = new RestApi(Utils.urls.api, () => Api.token);
    }
}
