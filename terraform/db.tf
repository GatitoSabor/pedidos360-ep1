# 1. Grupo de Seguridad para permitir conexión a la base de datos
resource "aws_security_group" "db_sg" {
  name        = "pedidos360_db_sg"
  description = "Permitir trafico a PostgreSQL"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Instancia RDS de PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier             = "pedidos360-db"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "pedidos360db"
  username               = "admindb"
  password               = "CloudNative2026!"
  skip_final_snapshot    = true # Vital para que AWS Academy te deje borrarla después sin errores
  publicly_accessible    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
}

# 3. Imprimir la URL de conexión al terminar
output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}