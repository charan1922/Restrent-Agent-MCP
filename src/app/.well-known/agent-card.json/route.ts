import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const host = request.headers.get("host") || "localhost:4444";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const card = {
    name: "Waiter Agent",
    description: "AI Restaurant Waiter and Reservation Manager",
    version: "1.0.0",
    homepage: `${baseUrl}/agent`,
    capabilities: [
      {
        type: "protocol",
        name: "a2a",
        version: "1.0",
        endpoints: [
          {
            type: "http",
            url: `${baseUrl}/api/a2a`,
            method: "POST"
          }
        ]
      },
      {
        type: "feature",
        name: "menu-query",
        description: "Query restaurant menu and dietary info"
      },
      {
        type: "feature",
        name: "reservations",
        description: "Manage table reservations"
      }
    ],
    authors: ["Charan Chatakondu"],
    license: "MIT"
  };

  return NextResponse.json(card);
}
