'use client'

import { axiosDigest } from "@/lib/axios";
import { useState } from "react";

// biome-ignore lint/style/noDefaultExport: Default export is necessary for Next.js
export default function Home() {
  const [response, setResponse] = useState<string | null>(null);

  const makeRequest = async () => {
    const response = (await axiosDigest.get("/digest/users")).data;
    setResponse(response);
  };

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl">Digest Authentication Test</h1>
      <button type="button" className="w-fit rounded-md bg-green-600 p-2" onClick={makeRequest}>Make Request</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}
