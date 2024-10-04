// Fake user data for the purpose of this example

interface User {
	id: number;
	username: string;
	password: string;
	email: string;
}

export const users: User[] = [
	{ id: 1, username: "john_doe", password: "password123", email: "john.doe@example.com" },
	{ id: 2, username: "jane_smith", password: "password456", email: "jane.smith@example.com" },
	{ id: 3, username: "alice_jones", password: "password789", email: "alice.jones@example.com" },
	{ id: 4, username: "bob_brown", password: "password101", email: "bob.brown@example.com" },
];
