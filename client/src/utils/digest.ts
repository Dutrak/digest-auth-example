// This file is used to create an axios instance that can handle digest authentication.

import axios, { type AxiosResponse, type AxiosRequestConfig, type CreateAxiosDefaults } from "axios";
import { MD5, lib } from "crypto-js";
import { getNounce, saveNounce, updateNonce } from "./nonce";

const md5 = (data: string) => {
	return MD5(data).toString();
};

async function generateDigestHeader(
	method: string,
	url: string,
	username: string,
	password: string,
	authParams: Record<string, string>,
	nc: string,
) {
	const { realm, nonce, qop, opaque, algorithm, uri = url } = authParams;

	const cnonce = lib.WordArray.random(16).toString();

	const HA1 = md5(`${username}:${realm}:${password}`);
	const HA2 = md5(`${method}:${uri}`);

	const response = md5(`${HA1}:${nonce}:${nc}:${cnonce}:${qop}:${HA2}`);

	let authHeader = `Digest username="${username}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${response}",qop=${qop},nc=${nc},cnonce="${cnonce}"`;

	if (opaque) authHeader += `, opaque="${opaque}"`;
	if (algorithm) authHeader += `, algorithm="${algorithm}"`;

	return authHeader;
}

function parseAuthHeader(authHeader: string) {
	const authParams: Record<string, string> = {};
	const parts = authHeader.replace("Digest ", "").split(",");

	for (const part of parts) {
		const [key, value] = part.split("=");
		authParams[key.trim()] = value.replace(/"/g, "");
	}

	return authParams;
}

export function createDigestAxiosInstance(username: string, password: string, config?: CreateAxiosDefaults) {
	const instance = axios.create({
		...config,
	});

	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		async (error) => {
			const { config, response } = error;

			if (response && response.status === 401 && response.headers["www-authenticate"]) {
				const authHeader = response.headers["www-authenticate"] as string;
				const authParams = parseAuthHeader(authHeader);
				const nonce = authParams.nonce;

				updateNonce(username, nonce);

				const nonceInfo = await getNounce(username);

				await saveNounce(username, nonceInfo.nonce, nonceInfo.count);

				const nc = nonceInfo.count.toString().padStart(8, "0");

				const newConfig: AxiosRequestConfig = {
					...config,
					headers: {
						...config.headers,
						Authorization: await generateDigestHeader(
							config.method?.toUpperCase() || "GET",
							config.url || "",
							username,
							password,
							authParams,
							nc,
						),
					},
				};

				return instance.request(newConfig);
			}
			return Promise.reject(error);
		},
	);

	return instance;
}
