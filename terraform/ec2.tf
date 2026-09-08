# 1. Grupo de seguridad para la EC2
resource "aws_security_group" "ec2_sg" {
  name        = "pedidos360-ec2-sg"
  description = "Permitir trafico HTTP hacia Spring Boot"

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # En producción se acota, para la EP1 permite la entrada de red
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Acceso SSH
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Instancia EC2 que actuara como servidor del Microservicio Backend
resource "aws_instance" "backend_server" {
  ami           = "ami-04a81a99f5ec58529" # Amazon Linux 2023 (o ajusta por region)
  instance_type = "t2.micro"
  key_name      = "tu-clave-ssh"          # Reemplaza con tu par de llaves si usas SSH, o remueve si no lo requieres

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install java-17-amazon-corretto -y
              EOF

  tags = {
    Name = "Pedidos360-Backend-Instance"
  }
}

# Output para conocer la IP pública de tu servidor en la nube
output "ec2_public_ip" {
  value = aws_instance.backend_server.public_ip
}