from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DishViewSet, OrderViewSet, login_view

router = DefaultRouter()
router.register(r'dishes', DishViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Rutas generadas por DefaultRouter
    path('login/', login_view, name='login'),  # Ruta para login
]