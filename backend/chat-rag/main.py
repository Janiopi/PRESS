from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from pymongo import MongoClient
import google.generativeai as genai
import os

# --------------------------
# Configuración Mongo
# --------------------------
MONGO_URI = "mongodb+srv://janiozapata072003_db_user:k7SOxbEy6XQBHHUz@cluster0.f6zetql.mongodb.net/?appName=Cluster0"
DB_NAME = "politica_db"
COLLECTION_NAME = "noticias"

client = MongoClient(MONGO_URI)
db_mongo = client[DB_NAME]
collection = db_mongo[COLLECTION_NAME]

news = list(collection.find({}, {"_id": 0}))
if not news:
    raise ValueError("No hay noticias en la base de datos.")

# --------------------------
# Convertir a documentos y embeddings
# --------------------------
docs = [Document(page_content=f"Título: {n['title']}\nDiario: {n['newspaper']}\nFecha: {n['date']}\nNoticia: {n['content']}\nURL: {n['imageURL']}") for n in news]

splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
texts = splitter.split_documents(docs)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = FAISS.from_documents(texts, embeddings)

# --------------------------
# Configuración Google Gemini
# --------------------------
os.environ["GOOGLE_API_KEY"] = "AIzaSyCKJxYyjsAjwWIohWVxD7LRz0DtJHbM4lo"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
from google.generativeai import GenerativeModel
model = GenerativeModel("gemini-2.0-flash")

# --------------------------
# FastAPI app
# --------------------------
app = FastAPI(title="RAG Noticias API")

class QueryRequest(BaseModel):
    query: str
    k: int = 3

@app.post("/query")
def rag_endpoint(req: QueryRequest):
    try:
        docs = db.similarity_search(req.query, k=req.k)
        context = "\n".join([d.page_content for d in docs])

        prompt = f"""
        Usa solo el siguiente contexto para responder de forma informativa y clara.
        Si la información no está en el contexto, di que no se encontró en las noticias.

        Contexto:
        {context}

        Pregunta: {req.query}
        """
        response = model.generate_content(prompt)
        return {"respuesta": response.text.strip(), "contexto": context}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
