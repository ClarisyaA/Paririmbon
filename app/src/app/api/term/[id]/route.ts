import { NextRequest, NextResponse } from "next/server";
import { sparqlQuery } from "@/lib/sparqlClient";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const detail = await sparqlQuery(`
      SELECT ?id ?label ?script ?def ?ctx ?class ?msTitle ?period ?wordClassStr WHERE {
        pari:${id} rdfs:label ?label ;
                   a ?class .
        OPTIONAL { pari:${id} pari:entryID ?eid }
        BIND(COALESCE(?eid, "${id}") AS ?id)
        OPTIONAL { pari:${id} pari:scriptTerm ?script }
        OPTIONAL { pari:${id} pari:definition ?def }
        OPTIONAL { pari:${id} pari:usageContext ?ctx }
        OPTIONAL { pari:${id} pari:wordClass ?wordClassStr }
        OPTIONAL {
          pari:${id} pari:foundInManuscript ?ms .
          ?ms rdfs:label ?msTitle .
          OPTIONAL { ?ms pari:creationPeriod ?period }
        }
        FILTER(?class != owl:NamedIndividual)
      }
    `);

    if (!detail.results.bindings.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const graph = await sparqlQuery(`
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
    `);

    const b = detail.results.bindings[0];
    const relations = (graph?.results?.bindings ?? []).map((r: Record<string, { value: string }>) => ({
      relation: r.rel?.value?.split("/").pop() ?? "",
      targetId: r.targetID?.value ?? "",
      targetLabel: r.targetLabel?.value ?? r.targetID?.value ?? "",
      direction: r.direction?.value ?? "",
    }));

    return NextResponse.json({
      id: b.id?.value,
      label: b.label?.value,
      scriptTerm: b.script?.value ?? null,
      definition: b.def?.value ?? null,
      usageContext: b.ctx?.value ?? null,
      wordClass: b.class?.value?.split("/").pop() ?? null,
      wordClassDisplay: b.wordClassStr?.value ?? null,
      manuscript: {
        title: b.msTitle?.value ?? null,
        period: b.period?.value ?? null,
      },
      relations,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Term detail error:", message);
    return NextResponse.json(
      { error: "Failed to fetch term", message },
      { status: 500 }
    );
  }
}
