"""
generate_dataset_final.py  —  VERSI FINAL BERSIH
=================================================
Perbaikan dari generate_dataset2.py (versi kamu):

  BUG 1 — ONTOLOGY_URI bukan URI valid
    Lama : URIRef("paririmbon_dataset.ttl")   <- relatif, bukan URI HTTP
    Fix  : URIRef("https://paririmbon.org/ontology")

  BUG 2 — foundInManuscript tidak masuk PRED_MAP
    Lama : PRED_MAP hanya dari OBJECT_PROPS (5 item, tidak ada foundInManuscript)
    Fix  : PRED_MAP dibangun dari OBJECT_PROPS + foundInManuscript secara eksplisit

  BUG 3 — relationType + targetWordID di sheet KOSAKATA tidak diproses
    Lama : loop kosakata tidak membaca kolom relationType / targetWordID sama sekali
    Fix  : ditambahkan blok pemrosesan relasi inline setelah data properties

  KEKURANGAN 1 — Individu Manuscript tidak punya creationPeriod
    Lama : Manuscript hanya punya rdf:type + rdfs:label
    Fix  : creationPeriod diambil dari baris pertama yang cocok dan disimpan ke Manuscript

  KEKURANGAN 2 — domain/range tidak ada di Object Properties
    Lama : loop OBJECT_PROPS tidak menambahkan rdfs:domain dan rdfs:range
    Fix  : ditambahkan domain Word + range Word (kecuali foundInManuscript → Manuscript)

Semua hal di atas sudah cukup untuk:
  • /api/search   — SPARQL FILTER REGEX pada latinTerm / definition
  • /api/term/[id]— DESCRIBE atau SELECT semua triple dari satu entri
  • /api/naskah   — SELECT Manuscript + creationPeriod + COUNT kata
  • Visualisasi D3.js / Sigma.js — CONSTRUCT graf relasi antar kata
"""

import re
import pandas as pd
from rdflib import Graph, Namespace, RDF, RDFS, OWL, XSD, Literal, URIRef
from rdflib.namespace import DCTERMS

# ─────────────────────────────────────────────────────────────
# 1. KONFIGURASI  —  sesuaikan path sebelum dijalankan
# ─────────────────────────────────────────────────────────────
BASE_URI     = "https://paririmbon.org/"
PARI         = Namespace(BASE_URI)

# BUG 1 FIX: ONTOLOGY_URI harus URI HTTP yang valid, bukan path relatif
ONTOLOGY_URI = URIRef("https://paririmbon.org/ontology")

# Ganti path sesuai lokasi file di komputer kamu
EXCEL_PATH   = r"C:\KULIAH\Semester-6\SemWeb\project-uas\paririmbon_dataset.xlsx"
OUTPUT_TTL   = r"C:\KULIAH\Semester-6\SemWeb\project-uas\paririmbon_dataset.ttl"


# ─────────────────────────────────────────────────────────────
# 2. DEFINISI METADATA & STRUKTUR
# ─────────────────────────────────────────────────────────────

CLASSES_ROOT = {
    "Word":       ("Kata",   "Kelas akar untuk semua entri kosakata dalam leksikon Paririmbon."),
    "Manuscript": ("Naskah", "Mewakili naskah sumber tempat kosakata berasal."),
}

SUPERCLASSES = {
    "Concept":   ("Konsep",   "Kategori konseptual abstrak dalam pemikiran Paririmbon."),
    "Attribute": ("Atribut",  "Kualitas dan karakteristik yang dikaitkan dengan makhluk atau objek."),
    "Action":    ("Tindakan", "Aktivitas, ritual, dan praktik yang dijelaskan dalam Paririmbon."),
    "Entity":    ("Entitas",  "Makhluk, tempat, dan objek yang konkret atau bernama."),
}

SUBCLASSES = {
    "Concept.ReligiousConcept":     ("Concept",   "Konsep Keagamaan",    "Konsep yang terkait dengan agama, ritual, dan hal sakral."),
    "Concept.PhilosophicalConcept": ("Concept",   "Konsep Filosofis",    "Ide-ide filosofis dan epistemologis abstrak."),
    "Concept.PoliticalConcept":     ("Concept",   "Konsep Politik",      "Konsep yang berkaitan dengan kekuasaan, tata negara, dan pemerintahan."),
    "Concept.SocialConcept":        ("Concept",   "Konsep Sosial",       "Ide yang berkaitan dengan struktur sosial dan komunitas."),
    "Concept.CosmologicalConcept":  ("Concept",   "Konsep Kosmologis",   "Konsep tentang kosmos, waktu, dan alam semesta."),
    "Concept.LiteraryWork":         ("Concept",   "Karya Sastra",        "Referensi ke karya sastra atau puitis dan genrenya."),
    "Attribute.AestheticAttribute": ("Attribute", "Atribut Estetika",    "Atribut yang terkait dengan keindahan, seni, dan estetika."),
    "Attribute.EmotionalAttribute": ("Attribute", "Atribut Emosional",   "Atribut yang menggambarkan emosi dan perasaan."),
    "Attribute.MoralAttribute":     ("Attribute", "Atribut Moral",       "Atribut yang berkaitan dengan etika dan karakter moral."),
    "Attribute.PhysicalAttribute":  ("Attribute", "Atribut Fisik",       "Sifat fisik atau material dari entitas."),
    "Attribute.SpiritualAttribute": ("Attribute", "Atribut Spiritual",   "Atribut yang berkaitan dengan hal spiritual atau metafisik."),
    "Action.RitualAction":          ("Action",    "Tindakan Ritual",     "Aktivitas upacara dan ritual."),
    "Action.SocialAction":          ("Action",    "Tindakan Sosial",     "Tindakan dalam konteks sosial atau komunal."),
    "Action.CommunicationAction":   ("Action",    "Tindakan Komunikasi", "Tindakan komunikasi verbal atau tertulis."),
    "Action.MovementAction":        ("Action",    "Tindakan Pergerakan", "Tindakan pergerakan fisik dan lokomosi."),
    "Entity.Person":                ("Entity",    "Orang",               "Individu manusia atau persona."),
    "Entity.Place":                 ("Entity",    "Tempat",              "Lokasi geografis atau kosmologis."),
    "Entity.Artifact":              ("Entity",    "Artefak",             "Objek dan alat buatan manusia."),
    "Entity.NaturalEntity":         ("Entity",    "Entitas Alam",        "Elemen dari alam semesta."),
    "Entity.MythologicalEntity":    ("Entity",    "Entitas Mitologi",    "Makhluk dan entitas dari mitos dan legenda."),
    "Entity.RoyalTitle":            ("Entity",    "Gelar Kerajaan",      "Gelar dan pangkat dalam hierarki kerajaan atau bangsawan."),
}

# Object Properties: (local_name, label, comment, is_symmetric)
OBJECT_PROPS = [
    ("isRelatedTo",       "berhubungan dengan", "Hubungan semantik umum antara dua entri kosakata.",           False),
    ("isSynonymOf",       "sinonim dari",       "Menunjukkan dua entri memiliki makna yang setara.",           True),
    ("isOppositeOf",      "lawan kata dari",    "Menunjukkan dua entri memiliki makna berlawanan (antonim).",  True),
    ("isDerivedFrom",     "diturunkan dari",    "Menunjukkan derivasi morfologis atau etimologis.",            False),
    ("isPartOf",          "bagian dari",        "Hubungan meronim: subjek adalah bagian dari objek.",          False),
    # foundInManuscript masuk OBJECT_PROPS agar T-Box-nya terdaftar bersama properti lain
    ("foundInManuscript", "ditemukan dalam",    "Menghubungkan entri kosakata ke individu Manuscript.",        False),
]

# BUG 2 FIX: PRED_MAP dibangun langsung dari OBJECT_PROPS (termasuk foundInManuscript)
PRED_MAP = {code: PARI[code] for code, *_ in OBJECT_PROPS}

# Data Properties — tetap dict (sudah benar di versi kamu)
DATA_PROPS = {
    "entryID":         PARI.entryID,
    "latinTerm":       PARI.latinTerm,
    "scriptTerm":      PARI.scriptTerm,
    "definition":      PARI.definition,
    "usageContext":    PARI.usageContext,
    "wordClass":       PARI.wordClass,
    "manuscriptTitle": PARI.manuscriptTitle,
    "creationPeriod":  PARI.creationPeriod,
}


# ─────────────────────────────────────────────────────────────
# 3. INISIALISASI GRAPH & DEKLARASI T-BOX
# ─────────────────────────────────────────────────────────────
print("[0/4] Mendaftarkan struktur ontologi (T-Box)...")
g = Graph()
g.bind("paririmbon", PARI)
g.bind("rdf",     RDF)
g.bind("rdfs",    RDFS)
g.bind("owl",     OWL)
g.bind("xsd",     XSD)
g.bind("dcterms", DCTERMS)

# Header Ontologi
g.add((ONTOLOGY_URI, RDF.type,        OWL.Ontology))
g.add((ONTOLOGY_URI, RDFS.label,      Literal("Ontologi Paririmbon", lang="id")))
g.add((ONTOLOGY_URI, RDFS.comment,    Literal(
    "Ontologi kosakata naskah kuno Sunda (Paririmbon) yang mencakup konsep, atribut, "
    "tindakan, dan entitas dalam tradisi intelektual Sunda.", lang="id")))
g.add((ONTOLOGY_URI, DCTERMS.created, Literal("2026-05-10", datatype=XSD.date)))
g.add((ONTOLOGY_URI, DCTERMS.creator, Literal("Proyek Digitalisasi Paririmbon")))

# Root Classes
for code, (label, comment) in CLASSES_ROOT.items():
    uri = PARI[code]
    g.add((uri, RDF.type,     OWL.Class))
    g.add((uri, RDFS.label,   Literal(label,   lang="id")))
    g.add((uri, RDFS.comment, Literal(comment, lang="id")))

# Superclasses
for code, (label, comment) in SUPERCLASSES.items():
    uri = PARI[code]
    g.add((uri, RDF.type,        OWL.Class))
    g.add((uri, RDFS.subClassOf, PARI.Word))
    g.add((uri, RDFS.label,      Literal(label,   lang="id")))
    g.add((uri, RDFS.comment,    Literal(comment, lang="id")))

# Subclasses
for code, (parent, label, comment) in SUBCLASSES.items():
    uri = PARI[code]
    g.add((uri, RDF.type,        OWL.Class))
    g.add((uri, RDFS.subClassOf, PARI[parent]))
    g.add((uri, RDFS.label,      Literal(label,   lang="id")))
    g.add((uri, RDFS.comment,    Literal(comment, lang="id")))

# Object Properties
# KEKURANGAN 2 FIX: ditambahkan rdfs:domain dan rdfs:range di setiap properti
for code, label, comment, symmetric in OBJECT_PROPS:
    uri = PARI[code]
    g.add((uri, RDF.type,     OWL.ObjectProperty))
    if symmetric:
        g.add((uri, RDF.type, OWL.SymmetricProperty))
    g.add((uri, RDFS.label,   Literal(label,   lang="id")))
    g.add((uri, RDFS.comment, Literal(comment, lang="id")))
    # domain dan range
    if code == "foundInManuscript":
        g.add((uri, RDFS.domain, PARI.Word))
        g.add((uri, RDFS.range,  PARI.Manuscript))
    else:
        g.add((uri, RDFS.domain, PARI.Word))
        g.add((uri, RDFS.range,  PARI.Word))

# hasPart sebagai inverseOf isPartOf
g.add((PARI.hasPart, RDF.type,      OWL.ObjectProperty))
g.add((PARI.hasPart, OWL.inverseOf, PARI.isPartOf))
g.add((PARI.hasPart, RDFS.label,    Literal("memiliki bagian", lang="id")))
g.add((PARI.hasPart, RDFS.domain,   PARI.Word))
g.add((PARI.hasPart, RDFS.range,    PARI.Word))

# Data Properties
for col, uri in DATA_PROPS.items():
    g.add((uri, RDF.type,    OWL.DatatypeProperty))
    g.add((uri, RDFS.domain, PARI.Word))
    g.add((uri, RDFS.range,  XSD.string))
    g.add((uri, RDFS.label,  Literal(col, lang="en")))

# manuscriptTitle + creationPeriod juga berlaku di kelas Manuscript
g.add((PARI.manuscriptTitle, RDFS.domain, PARI.Manuscript))
g.add((PARI.creationPeriod,  RDFS.domain, PARI.Manuscript))


# ─────────────────────────────────────────────────────────────
# 4. PRE-SCAN: kumpulkan metadata Manuscript sebelum loop utama
# ─────────────────────────────────────────────────────────────
# KEKURANGAN 1 FIX: buat individu Manuscript sekali di sini (bukan berulang di loop).
# creationPeriod diambil dari baris pertama yang punya nilai untuk judul tersebut.

def safe_local(title: str) -> str:
    """Ubah judul naskah menjadi local name yang aman untuk URI Turtle."""
    safe = re.sub(r"[^A-Za-z0-9]", "_", title)
    return "Manuscript_" + re.sub(r"_+", "_", safe).strip("_")

print("[1/4] Pre-scan metadata Manuscript...")
df_kosa_pre = pd.read_excel(EXCEL_PATH, sheet_name="KOSAKATA", dtype=str)
df_kosa_pre = df_kosa_pre.where(pd.notna(df_kosa_pre), None)

# Kumpulkan {judul: creationPeriod pertama yang tidak None}
manuscript_period: dict = {}
for _, row in df_kosa_pre.iterrows():
    title  = row.get("manuscriptTitle")
    period = row.get("creationPeriod")
    if title and str(title).strip():
        title = str(title).strip()
        if title not in manuscript_period:
            manuscript_period[title] = str(period).strip() if period else None

# Buat individu Manuscript + MANUSCRIPT_URIS lookup
MANUSCRIPT_URIS: dict = {}
for title, period in manuscript_period.items():
    local = safe_local(title)
    uri   = PARI[local]
    MANUSCRIPT_URIS[title] = uri
    g.add((uri, RDF.type,              PARI.Manuscript))
    g.add((uri, RDFS.label,            Literal(title, lang="id")))
    g.add((uri, PARI.manuscriptTitle,  Literal(title, datatype=XSD.string)))
    if period:
        g.add((uri, PARI.creationPeriod, Literal(period, datatype=XSD.string)))

print(f"      {len(MANUSCRIPT_URIS)} individu Manuscript terdaftar.")


# ─────────────────────────────────────────────────────────────
# 5. PROSES SHEET KOSAKATA (A-Box entri kata)
# ─────────────────────────────────────────────────────────────
print("[2/4] Membaca sheet KOSAKATA...")
df_kosa = pd.read_excel(EXCEL_PATH, sheet_name="KOSAKATA", dtype=str)
df_kosa = df_kosa.where(pd.notna(df_kosa), None)

n_entries        = 0
n_skipped        = 0
n_type_warnings  = 0
n_inline_rel     = 0

for _, row in df_kosa.iterrows():
    entry_id = row.get("entryID")
    if not entry_id or str(entry_id).strip() == "":
        n_skipped += 1
        continue

    entry_id = str(entry_id).strip()
    subject  = PARI[entry_id]

    # rdf:type
    word_class = row.get("wordClass")
    if word_class and str(word_class).strip() in SUBCLASSES:
        g.add((subject, RDF.type, PARI[str(word_class).strip()]))
    else:
        g.add((subject, RDF.type, PARI.Word))
        if word_class:
            n_type_warnings += 1

    # rdfs:label
    latin_term = row.get("latinTerm")
    if latin_term and str(latin_term).strip():
        g.add((subject, RDFS.label, Literal(str(latin_term).strip(), lang="su")))

    # Data Properties
    for col, prop_uri in DATA_PROPS.items():
        val = row.get(col)
        if val is not None and str(val).strip():
            g.add((subject, prop_uri, Literal(str(val).strip(), datatype=XSD.string)))

    # Hubungkan ke individu Manuscript (bukan literal berulang)
    ms_title = row.get("manuscriptTitle")
    if ms_title and str(ms_title).strip() in MANUSCRIPT_URIS:
        g.add((subject, PARI.foundInManuscript, MANUSCRIPT_URIS[str(ms_title).strip()]))

    # BUG 3 FIX: proses relasi inline dari kolom relationType + targetWordID
    rel_type  = row.get("relationType")
    target_id = row.get("targetWordID")
    if rel_type and target_id:
        rel_type  = str(rel_type).strip()
        target_id = str(target_id).strip()
        pred_uri  = PRED_MAP.get(rel_type)
        if pred_uri and target_id:
            g.add((subject, pred_uri, PARI[target_id]))
            n_inline_rel += 1

    n_entries += 1
    if n_entries % 200 == 0:
        print(f"      ... {n_entries} entri diproses")


# ─────────────────────────────────────────────────────────────
# 6. PROSES SHEET SPO (relasi tambahan)
# ─────────────────────────────────────────────────────────────
print(f"\n[3/4] Membaca sheet SPO...")
n_relations    = 0
n_spo_skipped  = 0
n_pred_unknown = 0

try:
    df_spo = pd.read_excel(EXCEL_PATH, sheet_name="SPO", dtype=str)
    df_spo = df_spo.where(pd.notna(df_spo), None)

    for _, row in df_spo.iterrows():
        subj_id  = row.get("Subject_ID")
        pred_str = row.get("Predicate")
        obj_id   = row.get("Object_ID")

        if not subj_id or not pred_str or not obj_id:
            n_spo_skipped += 1
            continue

        subj_id  = str(subj_id).strip()
        obj_id   = str(obj_id).strip()
        pred_str = str(pred_str).strip()

        # BUG 2 FIX: PRED_MAP adalah dict yang benar, .get() bekerja normal
        pred_uri = PRED_MAP.get(pred_str)
        if pred_uri is None:
            n_pred_unknown += 1
            continue

        g.add((PARI[subj_id], pred_uri, PARI[obj_id]))
        n_relations += 1

        if n_relations % 200 == 0:
            print(f"      ... {n_relations} relasi SPO diproses")

except ValueError:
    print("      Sheet 'SPO' tidak ditemukan, dilewati.")


# ─────────────────────────────────────────────────────────────
# 7. SERIALIZE
# ─────────────────────────────────────────────────────────────
print(f"\n[4/4] Menyimpan ke {OUTPUT_TTL}...")
g.serialize(destination=OUTPUT_TTL, format="turtle")

print(f"\n{'='*60}")
print(f"  BERHASIL: file TTL siap di-upload ke Apache Jena Fuseki")
print(f"{'='*60}")
print(f"  Total triple        : {len(g)}")
print(f"  Entri kosakata      : {n_entries}  (dilewati: {n_skipped})")
print(f"  Relasi inline       : {n_inline_rel}  (kolom KOSAKATA)")
print(f"  Relasi SPO          : {n_relations}  (sheet SPO)")
print(f"  Predicate tidak dikenal : {n_pred_unknown}")
print(f"  Type warnings       : {n_type_warnings}")
print(f"  Individu Manuscript : {len(MANUSCRIPT_URIS)}")
print(f"{'='*60}")
print()
print("  Query SPARQL yang sudah bisa dipakai:")
print()
print("  /api/search → FILTER REGEX(?label, 'query', 'i')")
print("  /api/term/[id] → DESCRIBE paririmbon:W0001")
print("  /api/naskah →")
print("    SELECT ?ms ?title ?period (COUNT(?word) AS ?n) WHERE {")
print("      ?ms a paririmbon:Manuscript ;")
print("          rdfs:label ?title .")
print("      OPTIONAL { ?ms paririmbon:creationPeriod ?period }")
print("      ?word paririmbon:foundInManuscript ?ms .")
print("    } GROUP BY ?ms ?title ?period ORDER BY ?title")
print(f"{'='*60}")