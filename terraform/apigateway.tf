# 1. Crear la HTTP API
resource "aws_apigatewayv2_api" "api_pedidos" {
  name          = "api-pedidos360"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["http://localhost:4200", "http://localhost:5173"]  
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# 2. Crear el JWT Authorizer enlazado a tu Cognito
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

# 3. Integración HTTP Proxy apuntando a tu EC2 (Spring Boot en puerto 8080)
resource "aws_apigatewayv2_integration" "backend_ec2" {
  api_id                 = aws_apigatewayv2_api.api_pedidos.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  integration_uri        = "http://${aws_instance.backend_server.public_ip}:8080/{proxy}"
  payload_format_version = "1.0"
}

# 4. Ruta comodín protegida por el Authorizer de Cognito
resource "aws_apigatewayv2_route" "ruta_protegida" {
  api_id    = aws_apigatewayv2_api.api_pedidos.id
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.backend_ec2.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt_auth.id
}

# 5. Stage por defecto
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api_pedidos.id
  name        = "$default"
  auto_deploy = true
}

# 6. Output de la URL del API Gateway
output "api_gateway_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}