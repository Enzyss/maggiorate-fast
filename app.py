from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import HTMLResponse
from telethon.sync import TelegramClient, events
import asyncio
from telethon.errors import SessionPasswordNeededError

API_ID = '3778637'
API_HASH = '27b204b5e5a74a77ec977f9cc951ae0b'
PHONE_NUMBER = '+393342033166'
CODE_HASH = ''

app = FastAPI()
telegram_code_sent = False


async def message_handler(event):
    print(event.message)

async def send_telegram_code():
    global telegram_code_sent
    if not telegram_code_sent:
        client = TelegramClient("session", API_ID, API_HASH)
        await client.connect()
        if await client.is_user_authorized():
            print("Sei già autorizzato!")
            client.add_event_handler(message_handler, events.NewMessage(incoming=True, chats=1742355648)) #1926114410
    # Mantieni il programma in esecuzione indefinitamente
            await client.run_until_disconnected()
        
        else:
            try:
                phone_code = await client.send_code_request(PHONE_NUMBER)
                global CODE_HASH
                CODE_HASH = phone_code.phone_code_hash
                telegram_code_sent = True
            except SessionPasswordNeededError:
                print("È richiesta una password di sessione.")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    await send_telegram_code()
    return """
    <html>
        <head>
            <title>Telegram Authentication</title>
        </head>
        <body>
            <form action="/verify" method="post">
                <label for="phone_code">Inserisci il codice ricevuto tramite SMS:</label><br>
                <input type="text" id="phone_code" name="phone_code"><br>
                <input type="submit" value="Invia">
            </form>
        </body>
    </html>
    """

@app.post("/verify")
async def verify(request: Request, phone_code: str = Form(...)):
    global telegram_code_sent
    if not telegram_code_sent:
        raise HTTPException(status_code=400, detail="Codice SMS non inviato")

    client = TelegramClient("session", API_ID, API_HASH)
    await client.connect()
    try:
        await client.sign_in(PHONE_NUMBER, code=phone_code,phone_code_hash=CODE_HASH)
        me = await client.get_me()
        client.add_event_handler(message_handler, events.NewMessage(incoming=True, chats=1742355648)) #1926114410
# Mantieni il programma in esecuzione indefinitamente
        await client.run_until_disconnected()
    except SessionPasswordNeededError:
        raise HTTPException(status_code=400, detail="È richiesta una password di sessione")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)
