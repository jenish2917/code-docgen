# Documentation for `authentication.py`

## Overview

Authentication views for the predictor app
## Dependencies

- `rest_framework.status`
- `rest_framework.views.APIView`
- `rest_framework.response.Response`
- `rest_framework_simplejwt.tokens.RefreshToken`
- `rest_framework.permissions.AllowAny`
- `django.contrib.auth.authenticate`
- `django.contrib.auth.models.User`
- `django.core.exceptions.ValidationError as DjangoValidationError`

## Classes

### `RegisterView`

API view for user registration

#### Attributes

- `permission_classes`: [AllowAny]

#### Methods

##### `post(self, request)`

Handle user registration

Parameters:
- `self`
- `request`

### `LoginView`

API view for user login

#### Attributes

- `permission_classes`: [AllowAny]

#### Methods

##### `post(self, request)`

Handle user login

Parameters:
- `self`
- `request`

