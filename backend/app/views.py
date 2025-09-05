# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import UploadedImage

@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        if 'file' in request.FILES:
            file = request.FILES['file']
            data = file.read()  # read file bytes

            # Save to DB
            uploaded_image = UploadedImage.objects.create(
                name=file.name,
                data=data,
                content_type=file.content_type
            )

            return JsonResponse({
                "message": "File uploaded successfully!",
                "filename": uploaded_image.name,
            })

        return JsonResponse({"error": "No file uploaded"}, status=400)

    return JsonResponse({"error": "Only POST allowed"}, status=405)
