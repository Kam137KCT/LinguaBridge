from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User


class UsernameOrEmailBackend(ModelBackend):
    """Allows logging in with either username or email in the same
    field. SimpleJWT's TokenObtainPairSerializer always passes the
    value as 'username' (Django's USERNAME_FIELD), regardless of
    whether the person actually typed a username or an email — so we
    just check both here."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        try:
            user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(
                Q(username__iexact=username) | Q(email__iexact=username)
            ).order_by("id").first()

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None