import { Slide, toast, ToastOptions } from 'react-toastify';

export enum ToastType {
    Info,
    Success,
    Error,
    Warning
}

const defaultOptions: ToastOptions = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "light",
    transition: Slide
};

export function emitToast(message: string, type: ToastType) {
    switch (type) {
        case ToastType.Info:
            toast.info(message, defaultOptions);
            break;
        case ToastType.Success:
            toast.success(message, defaultOptions);
            break;
        case ToastType.Error:
            toast.error(message, defaultOptions);
            break;
        case ToastType.Warning:
            toast.warn(message, defaultOptions);
            break;
    }
}