import { Auth } from '@firebase/auth';

export interface IInitializeParams{
  firebaseAuth?: Auth,
  forceSignInAnonymously: boolean,
}
