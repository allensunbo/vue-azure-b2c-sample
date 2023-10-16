import * as msal from "@azure/msal-browser";

import Vue, { PluginObject, VueConstructor } from "vue";

declare module "vue/types/vue" {
	interface Vue {
		$msal: MsalPlugin;
	}
}

export interface MsalPluginOptions {
	clientId: string;
	loginAuthority: string;
	passwordAuthority: string;
	knownAuthority: string;
}

let msalInstance: msal.PublicClientApplication;

export let msalPluginInstance: MsalPlugin;

export class MsalPlugin implements PluginObject<MsalPluginOptions> {

	private pluginOptions: MsalPluginOptions = {
		clientId: "",
		loginAuthority: "",
		passwordAuthority: "",
		knownAuthority: "",
	};

	public isAuthenticated = false;


	public install(vue: VueConstructor<Vue>, options?: MsalPluginOptions): void {
		if (!options) {
			throw new Error("MsalPluginOptions must be specified");
		}
		this.pluginOptions = options;
		this.initialize(options);
		msalPluginInstance = this;
		vue.prototype.$msal = Vue.observable(msalPluginInstance);
	}

	private initialize(options: MsalPluginOptions) {
		const msalConfig: msal.Configuration = {
			auth: {
				clientId: options.clientId,
				authority: options.loginAuthority,
				knownAuthorities: [options.knownAuthority],
				redirectUri: 'http://localhost:8080/',
				navigateToLoginRequestUrl: true, // If "true", will navigate back to the original request location before processing the auth code response.
			},
			cache: {
				cacheLocation: 'sessionStorage',
				storeAuthStateInCookie: false,
			},
			system: {
				loggerOptions: {
					loggerCallback: (level: msal.LogLevel, message: string, containsPii: boolean): void => {
						if (containsPii) {
							return;
						}
						switch (level) {
							case msal.LogLevel.Error:
								console.error(message);
								return;
							case msal.LogLevel.Info:
								console.info(message);
								return;
							case msal.LogLevel.Verbose:
								console.debug(message);
								return;
							case msal.LogLevel.Warning:
								console.warn(message);
								return;
						}
					},
					piiLoggingEnabled: false,
					logLevel: msal.LogLevel.Verbose
				}
			}
		};
		msalInstance = new msal.PublicClientApplication(msalConfig);
		msalInstance.handleRedirectPromise()
			.then(this.handleResponse)
			.catch((error) => {
				console.error(error);
			});
		this.isAuthenticated = this.getIsAuthenticated();
	}

	public handleResponse(response: any) {

		// let accountId = "";

		// if (response !== null) {
		// 	accountId = response.account.homeAccountId;
		// 	// Display signed-in user content, call API, etc.
		// } else {
		// 	// In case multiple accounts exist, you can select
		// 	// const currentAccounts = msalInstance.getAllAccounts();
		// 	// console.log(currentAccounts);		
		// 	// if (currentAccounts.length === 0) {
		// 	// 	const loginRequest: msal.RedirectRequest = {
		// 	// 		// scopes: ["openid", "profile", "offline_access", "https://davecob2cc.onmicrosoft.com/bcc7d959-3458-4197-a109-26e64938a435/access_api"],
		// 	// 		scopes: ["openid", "profile", "offline_access", msalInstance.getConfiguration().auth.clientId],
		// 	// 		redirectStartPage: ' http://localhost:8080/',
		// 	// };
		// 	// 	// no accounts signed-in, attempt to sign a user in
		// 	// 	debugger;
		// 	// 	msalInstance.loginRedirect(loginRequest);
		// 	// } else if (currentAccounts.length > 1) {
		// 	// 	// Add choose account code here
		// 	// } else if (currentAccounts.length === 1) {
		// 	// 	accountId = currentAccounts[0].homeAccountId;
		// 	// }

		// 	// selectAccount();

		// 	/**
		// 	 * If you already have a session that exists with the authentication server, you can use the ssoSilent() API
		// 	 * to make request for tokens without interaction, by providing a "login_hint" property. To try this, comment the 
		// 	 * line above and uncomment the section below.
		// 	 */

		// 	this.acquireToken().then(t => console.log(t));
		if (response !== null) {
			console.log(response.account.username);
			// alert(response.accessToken);
			sessionStorage.setItem('access_token', response.accessToken);
			msalPluginInstance.isAuthenticated = true;
		} else {
			const currentAccounts = msalInstance.getAllAccounts();

			if (currentAccounts.length === 0) {
				return;
			} else if (currentAccounts.length > 1) {
				// Add your account choosing logic here
				console.warn("Multiple accounts detected.");
			} else if (currentAccounts.length === 1) {
				console.log(currentAccounts[0].username);
				// showWelcomeMessage(username);
			}
		}
	}

	public async signIn() {
		const loginRequest: msal.RedirectRequest = {
			scopes: ["openid", "offline_access", "https://davecob2cc.onmicrosoft.com/bcc7d959-3458-4197-a109-26e64938a435/access_api"],
			redirectUri: 'http://localhost:8080/',
			// redirectStartPage: 'http://localhost:8080/',
			onRedirectNavigate(url) {
				debugger
			},

		};

		msalInstance.loginRedirect(loginRequest).then(() => {
			console.log(window.location.href);
		});
		// try {
		// 	// const accounts = msalInstance.getAllAccounts();
		// 	// console.log(msalInstance.getAllAccounts());
		// 	// if (accounts.length === 0) {
		// 	// 	// No user signed in
		// 	// 	msalInstance.loginRedirect(loginRequest).then(() => {
		// 	// 		console.log(111111111111111111111111);
		// 	// 		console.log(window.location.href);
		// 	// 	});
		// 	// }
		// 	msalInstance
		// 		.handleRedirectPromise()
		// 		.then((tokenResponse) => {
		// 			console.log('tokenResponse=', tokenResponse);
		// 			if (!tokenResponse) {
		// 				const accounts = msalInstance.getAllAccounts();
		// 				console.log('accounts=', accounts);
		// 				if (accounts.length === 0) {
		// 					// No user signed in
		// 					msalInstance.loginRedirect(loginRequest).then(() => {
		// 						console.log(window.location.href);
		// 					});
		// 				}
		// 			} else {
		// 				// msalInstance.loginRedirect(loginRequest);
		// 				// this.acquireToken();
		// 				console.log(window.location.href);
		// 			}
		// 		})
		// 		.then(() => {
		// 			console.log(1111111111111111);
		// 			this.acquireToken()
		// 				.then(v => {
		// 					console.log('***********************************', v);
		// 				});
		// 		})
		// 		.catch((err) => {
		// 			// Handle error
		// 			console.error(err);
		// 		});
		// 	this.isAuthenticated = true;
		// 	// do something with this?
		// } catch (err) {
		// 	console.error('err', err);
		// 	// handle error
		// 	if (err.errorMessage && err.errorMessage.indexOf("AADB2C90118") > -1) {
		// 		try {
		// 			msalInstance.loginRedirect(loginRequest);
		// 			// this.isAuthenticated = !!passwordResetResponse.account;
		// 		} catch (passwordResetError) {
		// 			console.error(passwordResetError);
		// 		}
		// 	} else {
		// 		this.isAuthenticated = false;
		// 	}

		// }
	}

	public async signOut() {
		await msalInstance.logout();
		this.isAuthenticated = false;
	}

	public async acquireToken() {
		console.log('acquireToken', msalInstance.getAllAccounts()[0]);
		const request = {
			account: msalInstance.getAllAccounts()[0],
			scopes: ["openid", "offline_access", "https://davecob2cc.onmicrosoft.com/bcc7d959-3458-4197-a109-26e64938a435/access_api"]
		};
		try {
			const response = await msalInstance.acquireTokenSilent(request);
			return response.accessToken;
		} catch (error) {
			if (error instanceof msal.InteractionRequiredAuthError) {
				return msalInstance.acquireTokenRedirect(request).catch((popupError) => {
					console.error(popupError);
				});
			}
			return false;
		}
	}

	private getIsAuthenticated(): boolean {
		const accounts: msal.AccountInfo[] = msalInstance.getAllAccounts();
		return accounts && accounts.length > 0;
	}
}
