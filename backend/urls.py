
from django.contrib import admin
from django.urls import path, include
from core.views import (
    UploadCodeView,
    UploadProjectView,
    UploadMultipleFilesView,
    UploadFolderView,
    GenerateDocsView,
    ExportDocsView,
    CreateTempDocumentView,
    AIStatusView,
    CodeFileListView,
    DocumentationListView,
    DocumentationDetailView,
    StatsView
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/upload/', UploadCodeView.as_view()),
    path('api/upload-project/', UploadProjectView.as_view()),
    path('api/upload-multiple/', UploadMultipleFilesView.as_view()),
    path('api/upload-folder/', UploadFolderView.as_view()),
    path('api/generate-docs/', GenerateDocsView.as_view()),
    path('api/export-docs/', ExportDocsView.as_view()),
    path('api/export-docs/create-temp/', CreateTempDocumentView.as_view()),
    path('api/ai-status/', AIStatusView.as_view()),
    path('api/files/', CodeFileListView.as_view()),
    path('api/documentation/', DocumentationListView.as_view()),
    path('api/documentation/<int:doc_id>/', DocumentationDetailView.as_view()),
    path('api/stats/', StatsView.as_view()),
    path('api/auth/', include('authentication.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)