import fastify from "fastify";
import cors from "@fastify/cors";
import { digestMiddleware } from "./middlewares/digest-middleware";
import { users } from "./users";

const server = fastify();

server.register(cors, {
	origin: "*", // allow all origins for the purpose of this example
	allowedHeaders: ["Authorization"],
	exposedHeaders: ["WWW-Authenticate"],
});

server.addHook("preHandler", digestMiddleware);

server.get("/", (_, reply) => {
	reply.send({ message: "Hello World" });
});

server.get("/digest", async (_, reply) => {
	reply.send({ message: "Authenticated" });
});

server.get("/digest/users", async (_, reply) => {
	reply.send({
		users,
	});
});

server.listen({ port: 3333 }, () => {
	console.log("Server is running on port 3333");
});
