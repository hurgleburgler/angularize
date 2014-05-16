from django.db import models

class Host(models.Model):
    name = models.CharField(max_length=40)
    ip = models.GenericIPAddressField(unique=True)
    state = models.CharField(max_length=40)
    status = models.CharField(max_length=40)

class Data(models.Model):
    host = models.ForeignKey('Host')
    value = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField()
