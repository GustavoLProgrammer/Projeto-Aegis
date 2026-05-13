# Armazenamento temporário

from datetime import datetime

historico_denuncias = []

def registrar_denuncia(tipo_solicitacao):
    """
    Funçâo para receber 'Emergência' ou 'Ajuda'
    """
    agora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    with open("log_denuncias.txt", "a") as arquivo:
        arquivo.write(f"[{agora}] Alerta: {tipo_solicitacao}\n")
        
    # Adiciona o tipo a lista
    historico_denuncias.append(tipo_solicitacao)
    print(f"Sucesso: {tipo_solicitacao} registrado no sistema.")