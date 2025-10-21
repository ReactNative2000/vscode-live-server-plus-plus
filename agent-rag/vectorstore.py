import math

class InMemoryVectorStore:
    def __init__(self):
        self.docs = []  # list of (id, text, vector)

    def add(self, doc_id, text, vector):
        self.docs.append((doc_id, text, vector))

    def _cosine(self, a, b):
        # both normalized
        return sum(x*y for x,y in zip(a,b))

    def search(self, query_vec, k=3):
        scored = []
        for doc_id, text, vec in self.docs:
            score = self._cosine(query_vec, vec)
            scored.append((score, doc_id, text))
        scored.sort(reverse=True, key=lambda t: t[0])
        return scored[:k]
