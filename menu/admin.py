from django.contrib import admin
from .models import Dish, Customer, Order, OrderItem

admin.site.register(Dish)
admin.site.register(Customer)
admin.site.register(Order)
admin.site.register(OrderItem)