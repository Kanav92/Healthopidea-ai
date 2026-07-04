import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

FAISS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "faiss_index")
)

def get_retriever():
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    db = FAISS.load_local(
        FAISS_DIR,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return db.as_retriever(search_kwargs={"k": 5})
