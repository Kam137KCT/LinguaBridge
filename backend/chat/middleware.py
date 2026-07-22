from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from accounts.models import User


@database_sync_to_async
def get_user_from_token(token_str):
    try:
        token = AccessToken(token_str)
        return User.objects.get(id=token["user_id"])
    except (TokenError, User.DoesNotExist):
        return None


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token_list = query_string.get("token")
        scope["user"] = await get_user_from_token(token_list[0]) if token_list else None
        return await super().__call__(scope, receive, send)