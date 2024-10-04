import type { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";

const noncesStore: Record<string, string> = {};

const users = {
	admin: "admin",
};

type DigestAuthParts = {
	realm: string;
	nonce: string;
	uri: string;
	response: string;
	qop: string;
	nc: string;
	cnonce: string;
};

const md5 = (data: string): string => crypto.createHash("md5").update(data).digest("hex");

const generateDigestHeader = (realm: string, nonce: string) => {
	return `Digest realm="${realm}",qop="auth",nonce="${nonce}",algorithm="MD5"`;
};

const verifyDigestAuth = (authHeader: string, method: string, nonce: string, user: string, password: string) => {
	const authParts: Partial<DigestAuthParts> = {};
	const parts = authHeader.replace("Digest ", "").split(",");

	for (const part of parts) {
		const [key, value] = part.split("=");
		authParts[key.trim() as keyof DigestAuthParts] = value.replace(/"/g, "");
	}

	const HA1 = md5(`${user}:${authParts.realm}:${password}`);
	const HA2 = md5(`${method}:${authParts.uri}`);
	const responseCheck = md5(`${HA1}:${nonce}:${authParts.nc}:${authParts.cnonce}:${authParts.qop}:${HA2}`);

	return responseCheck === authParts.response;
};

export async function digestMiddleware(request: FastifyRequest, reply: FastifyReply) {
	const authHeader = request.headers.authorization;

	const realm = "Fastify Digest Auth";
	const user = "admin";
	const password = users[user];

	const nonce = noncesStore[user] || crypto.randomBytes(16).toString("hex");
	noncesStore[user] = nonce;

	if (!user || !password) {
		reply.status(500).send("User and password are required");
		return;
	}

	if (!authHeader) {
		reply.header("WWW-Authenticate", generateDigestHeader(realm, nonce)).status(401).send("Authentication required");
		return;
	}

	if (!verifyDigestAuth(authHeader, request.method, nonce, user, password)) {
		reply.header("WWW-Authenticate", generateDigestHeader(realm, nonce)).status(401).send("Invalid credentials");
		return;
	}
}
