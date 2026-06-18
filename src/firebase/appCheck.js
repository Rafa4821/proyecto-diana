import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './client';

const recaptchaKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY;

let appCheck = null;

if (recaptchaKey) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export { appCheck };
