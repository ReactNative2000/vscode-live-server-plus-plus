import hashlib
import math

# Simple deterministic pseudo-embedding: hash the text and produce a vector of floats.
# This is NOT a real embedding — it's only for local testing and retrieval behavior.

def embed_text(text, dim=64):
    h = hashlib.sha256(text.encode('utf-8')).digest()
    vec = []
    # expand or contract to dim using repeated hashing
    while len(vec) < dim:
        h = hashlib.sha256(h).digest()
        for i in range(0, len(h), 4):
            if len(vec) >= dim:
                break
            seg = h[i:i+4]
            val = int.from_bytes(seg, 'big') / 2**32
            vec.append(val)
    # normalize
    norm = math.sqrt(sum(x*x for x in vec)) or 1.0
    vec = [x / norm for x in vec]
    return vec
