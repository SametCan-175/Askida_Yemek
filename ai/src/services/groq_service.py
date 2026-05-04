import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv() # .env dosyasındaki GROQ_API_KEY'i okur

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def groq_cagir(sistem_mesaji, kullanici_mesaji):
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": sistem_mesaji},
            {"role": "user", "content": kullanici_mesaji}
        ],
        temperature=0.7
    )
    return completion.choices[0].message.content