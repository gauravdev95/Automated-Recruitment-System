import re
import io
import pdfplumber
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# ------------------------ MODEL LOAD -----------------------
model = SentenceTransformer(
    "paraphrase-MiniLM-L3-v2",
    cache_folder="/app/model"
)

# ------------------------ CLEANING ------------------------
def clean_text(text: str):
    if not text:
        return ""
    return re.sub(r'[^a-zA-Z0-9\s\+\-\.]', ' ', text).lower()


# ------------------------ KEYWORD SCORE -------------------
def keyword_score(resume_text, jd_text):
    jd_words = set([w for w in re.findall(r'\b\w+\b', jd_text) if len(w) > 2])
    if not jd_words:
        return 0, []

    match = [w for w in jd_words if w in resume_text]
    missing = [w for w in jd_words if w not in resume_text]

    score = len(match) / len(jd_words)
    return score, missing


# ------------------------ SEMANTIC SCORE ------------------
def semantic_score(resume_text, jd_text):
    if not resume_text or not jd_text:
        return 0.0

    resume_embedding = model.encode([resume_text])[0]
    jd_embedding = model.encode([jd_text])[0]

    sim = cosine_similarity([resume_embedding], [jd_embedding])[0][0]
    return float(sim)


# ------------------------ FINAL SCORE ---------------------
# Hybrid scoring (keyword overlap + semantic embedding similarity)
# modeled after production resume-job matching systems:
#   Lavi, Medentsiy & Graus (2021), conSultantBERT - arXiv:2109.06501
def calculate_resume_score(resume_text, jd_text):
    resume_clean = clean_text(resume_text)
    jd_clean = clean_text(jd_text)

    k_score, missing = keyword_score(resume_clean, jd_clean)
    s_score = semantic_score(resume_clean, jd_clean)

    final = 0.5 * k_score + 0.5 * s_score

    return {
        "final_score": round(final * 100, 2),
        "keyword_score": round(k_score * 100, 2),
        "semantic_score": round(s_score * 100, 2),
        "missing_keywords": missing
    }


# ------------------------ PDF EXTRACT ---------------------
def extract_text_from_pdf(pdf_bytes: bytes):
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text
