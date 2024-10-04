// This file is used to handle the nonce value for digest authentication.

"use server";
import { cookies } from "next/headers";

export async function saveNounce(username: string, nonce: string, count: number) {
	const cookieStore = cookies();

	cookieStore.set({
		name: `nonceInfo_${username}`,
		value: JSON.stringify({ nonce, count }),
		maxAge: 60 * 60 * 24 * 7, // 1 week
		httpOnly: true,
	});
}

export async function getNounce(username: string) {
	const cookieStore = cookies();
	const cookie = cookieStore.get(`nonceInfo_${username}`);

	if (cookie) {
		return JSON.parse(cookie.value.toString());
	}

	return { nonce: "", count: 0 };
}

export async function updateNonce(username: string, nonce: string) {
	const info = await getNounce(username);

	info.nonce = nonce;
	info.count += 1;

	await saveNounce(username, info.nonce, info.count);
}
