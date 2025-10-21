from embed import embed_text
from vectorstore import InMemoryVectorStore

class MockLLM:
    # Extremely small mock LLM: echoes the question and includes top docs.
    def generate(self, prompt):
        # find the question marker
        q = ""
        if "QUESTION:" in prompt:
            q = prompt.split("QUESTION:")[-1].strip()
        docs = []
        if "RETRIEVED:" in prompt:
            docs = prompt.split("RETRIEVED:")[-1].strip()
        return f"Answer (mock): {q}\n\nContext used:\n{docs[:1000]}"

class RAG:
    def __init__(self):
        self.vs = InMemoryVectorStore()
        self.llm = MockLLM()

    def ingest(self, doc_id, text):
        v = embed_text(text)
        self.vs.add(doc_id, text, v)

    def query(self, question, k=3):
        qv = embed_text(question)
        hits = self.vs.search(qv, k=k)
        retrieved = "\n---\n".join([f"[{doc_id}] {text[:800]}" for (_score, doc_id, text) in hits])
        prompt = f"You are a helpful assistant. Use the retrieved context to answer the QUESTION below.\n\nRETRIEVED:\n{retrieved}\n\nQUESTION: {question}\n"
        return self.llm.generate(prompt)
