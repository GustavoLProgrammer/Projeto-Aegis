# backend_python/processador_denuncia.py
from datetime import datetime
import json
import mysql.connector  # Biblioteca que realiza a conexão e executa comandos dentro do banco MySQL

def registrar_denuncia_no_banco(tipo_solicitacao, categoria="Não Especificada", gps="-23.5505, -46.6333"):
    """
    Função principal do back-end em Python.
    Recebe os dados brutos disparados pelo Smartwatch, trata as coordenadas 
    para o formato do mapa Leaflet e efetua a gravação direta no banco MySQL.
    """
    # Captura a data e o horário do sistema para fins periciais de auditoria
    agora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    horario_formatado = datetime.now().strftime("%H:%M:%S")
    
    # TRATAMENTO GEOGRÁFICO: Quebra a string "lat, lng" enviada pelo relógio em coordenadas numéricas (float)
    try:
        # Divide o texto usando a vírgula como separador e converte os pedaços para float
        lat, lng = map(float, gps.split(','))
    except ValueError:
        # Mecanismo de segurança: Se o GPS do hardware falhar, define as coordenadas centrais de São Paulo
        lat, lng = -23.5505, -46.6333

    # CREDENCIAIS DO BANCO: Utiliza os mesmos parâmetros de acesso que o servidor Node.js usa
    config_banco = {
        'host': 'localhost',
        'user': 'root',
        'password': 'sua_senha_aqui', # Altere para a senha do banco do projeto
        'database': 'aegis_db'        # Altere para o nome do banco de dados do projeto
    }

    try:
        # Inicializa a conexão ativa com o servidor MySQL
        conexao = mysql.connector.connect(**config_banco)
        cursor = conexao.cursor()

        # QUERY SQL: Insere os dados tratados nos campos correspondentes da tabela unificada de denúncias
        query_insercao = """
        INSERT INTO denuncias (tipo, categoria, latitude, longitude, data_hora)
        VALUES (%s, %s, %s, %s, %s);
        """
        valores = (tipo_solicitacao, categoria, lat, lng, agora)
        
        cursor.execute(query_insercao, valores) # Executa o comando de inserção no banco
        conexao.commit() # Confirma e consolida a transação de forma persistente
        print(f"Sucesso: Alerta registrado no banco MySQL. Código de Registro: {cursor.lastrowid}")

    except mysql.connector.Error as erro:
        # Monitoramento de falhas: Executado caso o banco esteja offline ou as credenciais estejam erradas
        print(f"Erro crítico de comunicação com o MySQL: {erro}")
        conexao = None

    finally:
        # Regra de segurança: Sempre encerra a conexão para liberar memória no servidor de banco de dados
        if conexao and conexao.is_connected():
            cursor.close()
            conexao.close()
            print("Conexão com o servidor de banco de dados encerrada com sucesso.")

    # ESTRUTURAÇÃO DO EVENTO: Prepara o objeto para transmissão em tempo real via Socket.io para o mapa
    dados_mapa_leaflet = {
        "tipo": tipo_solicitacao,
        "categoria": categoria,
        "lat": lat,
        "lng": lng,
        "horario": horario_formatado
    }
    
    # Imprime a string no console para indicação visual do disparo de transmissão do WebSocket
    print(f"[SOCKET.IO EVENT] emit('novo_pedido_ajuda') -> {json.dumps(dados_mapa_leaflet)}")
    
    return dados_mapa_leaflet
