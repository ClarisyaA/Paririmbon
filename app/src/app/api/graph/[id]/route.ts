import { NextRequest, NextResponse } from "next/server";
import { sparqlQuery } from "@/lib/sparqlClient";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await sparqlQuery(`
      SELECT ?rel ?targetID ?targetLabel ?direction WHERE {
        {
          pari:${id} ?rel ?target .
          BIND("outgoing" AS ?direction)
        } UNION {
          ?target ?rel pari:${id} .
          BIND("incoming" AS ?direction)
        }
        OPTIONAL { ?target pari:entryID ?targetEID }
        BIND(COALESCE(?targetEID, REPLACE(STR(?target), "^.*[/#]", "")) AS ?targetID)
        OPTIONAL { ?target rdfs:label ?targetLabel }
        FILTER(?rel IN (
          pari:isRelatedTo, pari:isSynonymOf,
          pari:isOppositeOf, pari:isDerivedFrom, pari:isPartOf,
          pari:foundInManuscript
        ))
      }
      LIMIT 40
    `);

    const centerData = await sparqlQuery(`
      SELECT ?label WHERE { pari:${id} rdfs:label ?label } LIMIT 1
    `);
    const centerLabel = centerData?.results?.bindings?.[0]?.label?.value ?? id;

    const links = (data?.results?.bindings ?? []).map((b: Record<string, { value: string }>) => ({
      source: b.direction?.value === "outgoing" ? id : b.targetID?.value,
      target: b.direction?.value === "outgoing" ? b.targetID?.value : id,
      relation: b.rel?.value?.split("/").pop() ?? "",
    }));

    const nodeIds = new Set<string>([id]);
    links.forEach((l: { source: string; target: string }) => {
      nodeIds.add(l.source);
      nodeIds.add(l.target);
    });

    const labelMap: Record<string, string> = { [id]: centerLabel };
    (data?.results?.bindings ?? []).forEach((b: Record<string, { value: string }>) => {
      const tid = b.targetID?.value;
      if (tid) labelMap[tid] = b.targetLabel?.value ?? tid;
    });

    const nodes = Array.from(nodeIds).map((nid) => ({
      id: nid,
      label: labelMap[nid] ?? nid,
      isCenter: nid === id,
    }));

    return NextResponse.json({ nodes, links });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Graph error:", message);
    return NextResponse.json(
      { error: "Failed to fetch graph", message },
      { status: 500 }
    );
  }
}
