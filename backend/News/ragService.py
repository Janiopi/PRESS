# -*- coding: utf-8 -*-
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pymongo import MongoClient
import google.generativeai as genai
import os

# Cambia esto por tu conexión real
MONGO_URI = (
    "mongodb+srv://janiozapata072003_db_user:k7SOxbEy6XQBHHUz"
    "@cluster0.f6zetql.mongodb.net/?retryWrites=true&w=majority&tls=true"
)

DB_NAME = "noticias-politicas"
COLLECTION_NAME = "news"


try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("✅ Conexión a MongoDB exitosa.")
except Exception as e:
    print("❌ Error de conexión:", e)

client = MongoClient(MONGO_URI)
db_mongo = client[DB_NAME]
collection = db_mongo[COLLECTION_NAME]

news = list(collection.find({}, {"_id": 0}))  # traer todas sin el _id

if not news:
    raise ValueError("No hay noticias en la base de datos.")

docs = []
for n in news:
    contenido = f"Título: {n['title']}\nDiario: {n['newspaper']}\nFecha: {n['date']}\nNoticia: {n['content']}\nURL: {n['imageURL']}"
    docs.append(Document(page_content=contenido))

splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
texts = splitter.split_documents(docs)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
db = FAISS.from_documents(texts, embeddings)

os.environ["GOOGLE_API_KEY"] = "AIzaSyCKJxYyjsAjwWIohWVxD7LRz0DtJHbM4lo"
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

from google.generativeai import GenerativeModel

model = GenerativeModel("gemini-2.0-flash")


def rag_query(query, k=3):
    docs = db.similarity_search(query, k=k)
    context = "\n".join([d.page_content for d in docs])

    prompt = f"""
    Usa solo el siguiente contexto para responder de forma informativa y clara.
    Si la información no está en el contexto, di que no se encontró en las noticias.

    Contexto:
    {context}

    Pregunta: {query}
    """

    response = model.generate_content(prompt)
    return response.text.strip(), context


def generar_explicaciones(noticia_texto):
    prompt_youth = f"""
    Explica esta noticia con un lenguaje sencillo y amigable, como si se la contaras a un joven curioso.
    Noticia:
    {noticia_texto}
    """

    prompt_expert = f"""
    Explica esta noticia desde una perspectiva técnica o analítica, como si fuera para un experto en política.
    Noticia:
    {noticia_texto}
    """

    explicacion_youth = model.generate_content(prompt_youth).text.strip()
    explicacion_expert = model.generate_content(prompt_expert).text.strip()

    return explicacion_youth, explicacion_expert


if __name__ == "__main__":
    pregunta = "¿Qué se sabe sobre las últimas declaraciones de Keiko Fujimori?"
    respuesta, contexto = rag_query(pregunta)

    print("🧩 Respuesta del modelo:")
    print(respuesta)
    print("\n📰 Contexto usado:")
    print(contexto)

    print("\n=== Generando explicaciones ===")
    explicacion_joven, explicacion_experto = generar_explicaciones(respuesta)
    print("\n👦 Para jóvenes:\n", explicacion_joven)
    print("\n👨‍💼 Para expertos:\n", explicacion_experto)
