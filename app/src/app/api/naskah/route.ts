import { NextResponse } from "next/server";
import { sparqlQuery } from "@/lib/sparqlClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await sparqlQuery(`
      SELECT ?ms ?title ?period (COUNT(?word) AS ?wordCount) WHERE {
        ?ms a pari:Manuscript ;
            rdfs:label ?title .
        OPTIONAL { ?ms pari:creationPeriod ?period }
        ?word pari:foundInManuscript ?ms .
      }
      GROUP BY ?ms ?title ?period
      ORDER BY ?title
    `);

    const manuscripts = (data?.results?.bindings ?? []).map((b: Record<string, { value: string }>) => ({
      uri: b.ms?.value ?? "",
      title: b.title?.value ?? "",
      period: b.period?.value ?? "Tidak diketahui",
      wordCount: Number(b.wordCount?.value ?? 0),
    }));

    return NextResponse.json({ manuscripts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Naskah error:", message);
    return NextResponse.json(
      { error: "Failed to fetch manuscripts", message },
      { status: 500 }
    );
  }
}
