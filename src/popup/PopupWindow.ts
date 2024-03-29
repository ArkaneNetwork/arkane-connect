import { DialogWindow } from '../dialog/DialogWindow';
import Utils from '../utils/Utils';

export class PopupWindow {
    private static CONST = {
        overlayClassName: 'venly-connect__overlay',
        overlayLinkClassName: 'venly-connect__reopen-link',
        overlayCloseLinkClassName: 'venly-connect__close-link',
        overlayMessage: 'Don’t see the popup? We’ll help you re-open the popup to complete your action.',
        overlayLinkMessage: 'Click to continue',
        overlayLinkStyle: 'color: white; text-decoration: underline; font-weight: bold;',
    };

    public static openNew(url: string,
                          options?: OpenWindowOptions): PopupWindow {
        const mergedOptions = Object.assign({
            title: 'Venly Connect',
            w: 350,
            h: 700,
            useOverlay: true
        }, options);
        const left = (screen.width / 2) - (mergedOptions.w / 2);
        const top = (screen.height / 2) - (mergedOptions.h / 2);
        let features = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, ';
        features += `copyhistory=no, width=${mergedOptions.w}, height=${mergedOptions.h}, top=${top}, left=${left}`;
        return new PopupWindow(url, mergedOptions.title, features, mergedOptions.useOverlay);
    }

    private readonly useOverlay: boolean;
    private readonly id: string;
    private win?: Window | null;
    private interval?: number;

    constructor(url?: string,
                target?: string,
                features?: string,
                useOverlay?: boolean,
                replace?: boolean) {
        this.id = `id-${Utils.uuidv4()}`;
        this.useOverlay = typeof useOverlay !== 'undefined' ? useOverlay : true;
        this.win = window.open(url, target, features);
        if (this.win) {
            this.setCloseInterval();
        } else {
            throw new Error('Something went wrong while trying to open the popup');
        }
        this.openOverlay();
    }

    private setCloseInterval() {
        this.interval = window.setInterval(() => {
            if (!this.win || this.win.closed) {
                this.clearCloseInterval();
                this.close();
            }
        }, 100);
    }

    private clearCloseInterval() {
        window.clearInterval(this.interval);
    }

    public close() {
        if (this.win) {
            this.win.close();
            this.closeOverlay();
        }
    }

    public get closed(): boolean {
        if (this.win) {
            return this.win.closed;
        } else {
            return true;
        }
    }

    public focus() {
        if (this.win) {
            this.win.focus();
        }
    }

    public postMessage(message: any,
                       targetOrigin: string,
                       transfer?: Transferable[]): void {
        if (this.win) {
            this.win.postMessage(message, targetOrigin, transfer);
        }
    }

    private closeOverlay(): void {
        PopupWindow.closeOverlay(this.id, this.useOverlay);
    }

    public openOverlay(): void {
        PopupWindow.openOverlay(this.id, this.useOverlay, this.focus.bind(this), this.close.bind(this));
    }

    static closeOverlay(id: string, useOverlay: boolean): void {
        const overlayContainer = document.querySelector(`#venly-overlay-container, #${id}`);
        if (overlayContainer)
          overlayContainer.remove();
    }

    static openOverlay(id: string, useOverlay: boolean, focus: () => void, close: () => void): void {
        if (useOverlay) {
            DialogWindow.showRefocusLayout(id, focus);
        }
    }
}

export interface OpenWindowOptions {
    title?: string,
    w?: number,
    h?: number,
    useOverlay?: boolean,
}
