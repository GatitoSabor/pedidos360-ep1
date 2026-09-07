# El user pool es el "tenant": el directorio donde viven los
# usuarios y el servidor de autorización que emite los tokens[cite: 3].
resource "aws_cognito_user_pool" "pool" {
  name = "pedidos360-pool"

  # El correo es el nombre de usuario[cite: 3].
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

# El dominio publica los endpoints estándar /oauth2/authorize y /oauth2/token[cite: 3].
resource "aws_cognito_user_pool_domain" "hosted_ui" {
  domain       = "pedidos360-williams-2" # ¡Recuerda que este nombre debe ser único en todo AWS! Si te da error, agrégale algún número al final[cite: 3].
  user_pool_id = aws_cognito_user_pool.pool.id
}

# Nuestro futuro front es un CLIENTE PÚBLICO: su código se descarga
# completo en el navegador, así que no puede guardar un secreto[cite: 3].
# Por eso generate_secret = false y usaremos el flujo Authorization Code + PKCE[cite: 3].
resource "aws_cognito_user_pool_client" "spa" {
  name         = "spa-pedidos360"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  # ATENCIÓN AQUÍ: Si vas a usar Angular, deja el puerto 4200. 
  # Si vas a usar React con Vite, cámbialo a http://localhost:5173/
  # La barra final (/) es obligatoria[cite: 3].
  callback_urls = ["http://localhost:4200/"] 
  logout_urls   = ["http://localhost:4200/"]

  # Permite autenticación con contraseña solo para pruebas; los tokens expiran en 60 min[cite: 3].
  explicit_auth_flows   = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  access_token_validity = 60
  id_token_validity     = 60

  token_validity_units {
    access_token = "minutes"
    id_token     = "minutes"
  }
}