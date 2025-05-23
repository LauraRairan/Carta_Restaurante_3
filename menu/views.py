from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Dish, Order
from .serializers import DishSerializer, OrderSerializer
from django.contrib.auth import authenticate, login
from django.http import JsonResponse

def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"status": "success", "message": "Inicio de sesión exitoso"})
        else:
            return JsonResponse({"status": "error", "message": "Usuario o contraseña incorrectos"}, status=401)
    return JsonResponse({"status": "error", "message": "Use POST para iniciar sesión"}, status=405)

class DishViewSet(viewsets.ModelViewSet):
    queryset = Dish.objects.all()
    serializer_class = DishSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        customer_name = self.request.query_params.get('customer__name__icontains', None)
        if status:
            queryset = queryset.filter(status=status)
        if customer_name:
            queryset = queryset.filter(customer__name__icontains=customer_name)
        return queryset