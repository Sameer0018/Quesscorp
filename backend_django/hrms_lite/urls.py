from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from core.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health),
    path('api/', include('core.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/api-docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
