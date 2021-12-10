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

export interface IAnalytics {
  initialize(params: InitializeParams): void,
  trackView(viewName: string, properties: Record<string, unknown>, modules?: string[]): void,
  trackEvent(eventName: string, properties: Record<string, unknown>, modules?: string[]): void,
  trackConversion(conversionLabel: string): void,
  setGlobalProperties(property: string, value: Record<string, unknown> | string): void,
}
