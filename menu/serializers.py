from rest_framework import serializers # type: ignore
from .models import Dish, Customer, Order, OrderItem

class DishSerializer(serializers.ModelSerializer):
         class Meta:
             model = Dish
             fields = ['id', 'name', 'category', 'description', 'price', 'image']

class CustomerSerializer(serializers.ModelSerializer):
         class Meta:
             model = Customer
             fields = ['id', 'name', 'address', 'phone']

class OrderItemSerializer(serializers.ModelSerializer):
         dish = DishSerializer(read_only=True)
         dish_id = serializers.PrimaryKeyRelatedField(queryset=Dish.objects.all(), source='dish', write_only=True)

         class Meta:
             model = OrderItem
             fields = ['id', 'dish', 'dish_id', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
         items = OrderItemSerializer(many=True)
         customer = CustomerSerializer()

         class Meta:
             model = Order
             fields = ['id', 'customer', 'created_at', 'status', 'total', 'items']

         def create(self, validated_data):
             customer_data = validated_data.pop('customer')
             items_data = validated_data.pop('items')
             customer = Customer.objects.create(**customer_data)
             order = Order.objects.create(customer=customer, **validated_data)
             for item_data in items_data:
                 OrderItem.objects.create(order=order, **item_data)
             return order

         def update(self, instance, validated_data):
             if 'status' in validated_data:
                 instance.status = validated_data.get('status', instance.status)
                 instance.save()
             return instance