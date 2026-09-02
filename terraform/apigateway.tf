# 1. Crear la HTTP API
resource "aws_apigatewayv2_api" "api_pedidos" {
  name          = "api-pedidos360"
  protocol_type = "HTTP"

  # Configuración CORS obligatoria para que el navegador no bloquee al frontend
  cors_configuration {
    allow_origins = ["http://localhost:4200"] 
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# 2. Crear el JWT Authorizer enlazado a tu Cognito recién creado
resource "aws_apigatewayv2_authorizer" "jwt_auth" {
  api_id           = aws_apigatewayv2_api.api_pedidos.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.spa.id]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
  }
}

# 3. Integración HTTP Proxy de prueba
resource "aws_apigatewayv2_integration" "backend" {
  api_id                 = aws_apigatewayv2_api.api_pedidos.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "GET"
  integration_uri        = "https://mindicador.cl/api" 
  payload_format_version = "1.0"
}

# 4. Ruta versionada y protegida por el Authorizer
resource "aws_apigatewayv2_route" "ruta_protegida" {
  api_id    = aws_apigatewayv2_api.api_pedidos.id
  route_key = "GET /v1/datos"
  target    = "integrations/${aws_apigatewayv2_integration.backend.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt_auth.id
}

# 5. Stage por defecto para desplegar los cambios automáticamente
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api_pedidos.id
  name        = "$default"
  auto_deploy = true
}

# 6. Imprimir la URL base del API Gateway al terminar
output "api_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}