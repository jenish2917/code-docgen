from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
import os
from .utils.code_parser import parse_codebase

class UploadCodeView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        uploaded_file = request.FILES['file']
        save_path = f'media/{uploaded_file.name}'
        with open(save_path, 'wb+') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        doc = parse_codebase(save_path)
        with open(f'docs_output/{uploaded_file.name}_doc.md', 'w') as f:
            f.write(doc)
        return Response({'status': 'success', 'doc': doc})
