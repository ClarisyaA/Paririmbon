export const FUSEKI_ENDPOINT =
  process.env.FUSEKI_URL ?? "http://localhost:3030/paririmbon/query";

export const PREFIX = `
PREFIX pari: <https://paririmbon.org/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
`;

export async function sparqlQuery(query: string) {
  const fullQuery = PREFIX + "\n" + query;
  const res = await fetch(FUSEKI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/sparql-results+json",
    },
    body: new URLSearchParams({ query: fullQuery }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Fuseki error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
