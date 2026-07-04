import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))

from langchain_groq import ChatGroq
from langchain_classic.chains import ConversationalRetrievalChain
from app.rag.retriever import get_retriever

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_chain():
    llm = ChatGroq(
        api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.3,
    )
    retriever = get_retriever()
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        return_source_documents=False,
        verbose=False,
    )
    return chain
