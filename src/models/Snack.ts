export enum SnackType {
    SUCCESS = 'success',
    DANGER = 'danger',
    INFO = 'info',
    DEFAULT = 'info',
}

export interface Snack {
    'type': SnackType;
    'message': string;
    'blocking': boolean;
}
