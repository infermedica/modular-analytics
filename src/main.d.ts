import { Auth } from '@firebase/auth';
import { FirebaseOptions } from '@firebase/app';

export type InitializeParams = IAnonymousInitializeParams | IAuthenticatedInitializeParams;

interface IAnonymousInitializeParams {
  firebaseConfig: FirebaseOptions,
  forceSignInAnonymously: true,
}

interface IAuthenticatedInitializeParams {
  firebaseAuth: Auth,
  forceSignInAnonymously: false,
}
