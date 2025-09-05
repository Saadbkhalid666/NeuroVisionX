from django.contrib import admin

# Register your models here.
from app.models import UploadedImage

admin.site.site_header = "FaceLens Admin"      # Top-left header
admin.site.site_title = "FaceLens Portal"      # Browser tab title
admin.site.index_title = "Welcome to FaceLens Dashboard"  # Main index page

admin.site.register(UploadedImage)