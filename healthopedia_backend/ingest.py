"""
ingest.py — run this ONCE to build the FAISS vector index from the PDF.
Usage: python ingest.py
Output: saves the index to faiss_index/
"""

import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FAISS_DIR = os.path.join(os.path.dirname(__file__), "faiss_index")

def get_pdf_path():
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    if not files:
        raise FileNotFoundError("No PDF found in healthopedia_backend/data/")
    return os.path.join(DATA_DIR, files[0])

def build_index():
    pdf_path = get_pdf_path()
    print(f"Loading PDF: {pdf_path}")

    # 1. Load PDF
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages")

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks")

    # 3. Generate embeddings
    print("Generating embeddings with BAAI/bge-small-en-v1.5 ...")
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )

    # 4. Build and save FAISS index
    print("Building FAISS index ...")
    db = FAISS.from_documents(chunks, embeddings)
    db.save_local(FAISS_DIR)
    print(f"FAISS index saved to {FAISS_DIR}")

if __name__ == "__main__":
    build_index()
