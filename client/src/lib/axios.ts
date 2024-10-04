import { createDigestAxiosInstance } from "@/utils/digest";

export const axiosDigest = createDigestAxiosInstance("admin", "admin", {
	baseURL: "http://localhost:3333",
});
