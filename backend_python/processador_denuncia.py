import os
from dotenv import load_dotenv
import mysql.connector
import sys
import json
from datetime import datetime

config_banco = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_DATABASE', 'aegis_db')
}

def registrar_denuncia_no_banco(tipo_solicitacao, categoria, gps, endereco):
    try:
        lat, lng = map(float, gps.split(','))
    except ValueError:
        lat, lng = -23.5505, -46.6333

    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conexao = None

    try:
        conexao = mysql.connector.connect(**config_banco)
        cursor = conexao.cursor()

        query_insercao = """
        INSERT INTO denuncias (tipo, categoria, latitude, longitude, endereco, data_hora) 
        VALUES (%s, %s, %s, %s, %s, %s);
        """
        valores = (tipo_solicitacao, categoria, lat, lng, endereco, agora)

        cursor.execute(query_insercao, valores)
        conexao.commit() 
        
        dados_mapa_leaflet = {
            "tipo": tipo_solicitacao,
            "categoria": categoria,
            "lat": lat,
            "lng": lng,
            "endereco": endereco,
            "horario": datetime.now().strftime("%H:%M:%S")
        }
        print(json.dumps(dados_mapa_leaflet))

    except mysql.connector.Error as erro:
        print(f"Erro no MySQL: {erro}")
    finally:
        if conexao and conexao.is_connected():
            cursor.close()
            conexao.close()

if __name__ == "__main__":
    if len(sys.argv) >= 5:
        registrar_denuncia_no_banco(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
