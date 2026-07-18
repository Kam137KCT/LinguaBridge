import asyncio
import json
import websockets

ROOM_ID = 1     # replace with your actual room id
SENDER_ID = 2   # replace with alex's actual user id

async def test():
    uri = "ws://127.0.0.1:8000/ws/chat/1/?user_id=2"

    # Define an origin header that Django expects
    custom_headers = {"Origin": "http://127.0.0.1"}

    async with websockets.connect(uri, additional_headers=custom_headers) as ws:
        await ws.send(json.dumps({"text": "Hello, how are you?"}))
        response = await ws.recv()
        print(json.dumps(json.loads(response), indent=2))

asyncio.run(test())