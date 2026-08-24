from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User


class UsernameOrEmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        
        users = User.objects.filter(Q(username__iexact=username) | Q(email__iexact=username))
        for user in users:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None