import { NextRequest, NextResponse } from "next/server";
import { sparqlQuery } from "@/lib/sparqlClient";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const cls = searchParams.get("class") ?? "";
  const limitParam = searchParams.get("limit") ?? "10";
  const limit = limitParam === "all" ? -1 : Number(limitParam);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (!q) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const isWildcard = q === "*";
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&");
  
  // Clean filtering logic for Kosakata (SundaKunoTerm) subclasses and Manuscript root class
  let classFilter = "";
  if (cls === "SundaKunoTerm") {
    classFilter = "FILTER(EXISTS { ?class rdfs:subClassOf* pari:Word })";
  } else if (cls === "Manuscript") {
    classFilter = "FILTER(?class = pari:Manuscript)";
  } else {
    classFilter = "FILTER(?class = pari:Manuscript || EXISTS { ?class rdfs:subClassOf* pari:Word })";
  }

  const regexFilter = isWildcard
    ? ""
    : `FILTER(
        REGEX(STR(?label), "${escaped}", "i") ||
        REGEX(STR(?def), "${escaped}", "i") ||
        REGEX(STR(?msTitle), "${escaped}", "i")
      )`;

  try {
    const data = await sparqlQuery(`
      SELECT ?id ?label ?script ?def ?class ?msTitle WHERE {
        ?word rdfs:label ?label ;
              a ?class .
        OPTIONAL { ?word pari:entryID ?eid }
        BIND(COALESCE(?eid, REPLACE(STR(?word), "^.*[/#]", "")) AS ?id)
        OPTIONAL { ?word pari:scriptTerm ?script }
        OPTIONAL { ?word pari:definition ?def }
        OPTIONAL { ?word pari:manuscriptTitle ?msTitle }
        ${regexFilter}
        ${classFilter}
      }
      ORDER BY ?label
    `);

    const allResults = (data?.results?.bindings ?? []).map((b: Record<string, { value: string }>) => ({
      id: b.id?.value ?? "",
      label: b.label?.value ?? "",
      scriptTerm: b.script?.value ?? null,
      definition: b.def?.value ?? null,
      wordClass: b.class?.value?.split("/").pop() ?? null,
      manuscriptTitle: b.msTitle?.value ?? null,
    }));

    const total = allResults.length;
    const sliced = limit === -1 ? allResults : allResults.slice(offset, offset + limit);

    return NextResponse.json({ results: sliced, total });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Search error:", message);
    return NextResponse.json(
      { error: "Failed to fetch data", message },
      { status: 500 }
    );
  }
}
