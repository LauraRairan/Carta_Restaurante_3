from django.db import models # type: ignore

class Dish(models.Model):
         CATEGORIES = [
             ('ENTRADA', 'Entrada'),
             ('PLATO', 'Plato Fuerte'),
             ('BEBIDA', 'Bebida'),
             ('POSTRE', 'Postre'),
         ]
         name = models.CharField(max_length=100)
         category = models.CharField(max_length=20, choices=CATEGORIES)
         description = models.TextField()
         price = models.DecimalField(max_digits=10, decimal_places=2)
         image = models.URLField(blank=True, null=True)

         def __str__(self):
             return self.name

class Customer(models.Model):
         name = models.CharField(max_length=100)
         address = models.CharField(max_length=200)
         phone = models.CharField(max_length=20)

         def __str__(self):
             return self.name
class Order(models.Model):
         STATUS = [
             ('PENDIENTE', 'Pendiente'),
             ('ATENDIDO', 'Atendido'),
         ]
         customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
         created_at = models.DateTimeField(auto_now_add=True)
         status = models.CharField(max_length=20, choices=STATUS, default='PENDIENTE')
         total = models.DecimalField(max_digits=10, decimal_places=2)

         def __str__(self):
             return f"Pedido {self.id} - {self.customer.name}"

class OrderItem(models.Model):
         order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
         dish = models.ForeignKey(Dish, on_delete=models.CASCADE)
         quantity = models.PositiveIntegerField()
         price = models.DecimalField(max_digits=10, decimal_places=2)

         def __str__(self):
             return f"{self.quantity} x {self.dish.name}"