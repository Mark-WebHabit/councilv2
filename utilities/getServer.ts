import axios from "axios";

interface Server {
  name: string;
  zone: string;
}

interface ServerResponse {
  servers: Server[];
}

export async function getBestServer(): Promise<ServerResponse> {
  try {
    const { data } = await axios.get("https://api.gofile.io/servers");

    if (data.status !== "ok") {
      throw new Error(`API Error: ${data.status}`);
    }

    const servers: Server[] = data.data.serversAllZone.map((server: any) => ({
      name: server.name,
      zone: server.zone,
    }));

    return { servers };
  } catch (error: any) {
    throw error;
  }
}
