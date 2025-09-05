from django.db import models

class UploadedImage(models.Model):
    name = models.CharField(max_length=255, blank=True)  
    data = models.BinaryField(default=b'')  
    content_type = models.CharField(max_length=50, default='image/jpeg')

    def __str__(self):
        return self.name
