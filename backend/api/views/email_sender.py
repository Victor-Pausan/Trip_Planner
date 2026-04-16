from django.core.mail import send_mail
import re
from rest_framework import status

from backend import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['POST'])
def send_invite(request):
    email = request.data.get('email')
    group_slug = request.data.get('group_slug')

    invite_link = f'http://localhost:5173/group/join/{group_slug}'

    x = re.search(r"^\S+@\S+\.\S+$", email)
    if x:
        send_mail(
            subject="Tripstoo group invitation",
            message=f"You've been invited to join a group trip!\nClick here to join: {invite_link}",
            from_email = settings.EMAIL_HOST_USER,
            recipient_list = [email],
        )
        return Response(data={'message': 'Invite sent!'}, status=status.HTTP_200_OK)
    return Response(data={'message': 'Email address is invalid!'}, status=status.HTTP_400_BAD_REQUEST)