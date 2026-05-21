# Armazenamento temporário
from datetime import datetime

historico_denuncias = []

def registrar_denuncia(tipo_solicitacao, categoria="Não Especificada", gps="-23.5505, -46.6333"):
    """
    Função adaptada para receber 'Emergência' ou 'Ajuda' junto com a categoria 
    selecionada via botões e a localização automática do dispositivo.
    """
    agora = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
    # Monta a linha de registro detalhada baseada nos botões acionados
    linha_log = f"[{agora}] Alerta: {tipo_solicitacao} | Categoria: {categoria} | GPS: {gps}\n"
    
    with open("log_denuncias.txt", "a", encoding="utf-8") as arquivo:
        arquivo.write(linha_log)
        
    # Adiciona o dicionário estruturado ao histórico em memória
    historico_denuncias.append({
        "tipo": tipo_solicitacao,
        "categoria": categoria,
        "gps": gps,
        "data": agora
    })
    
    print(f"Sucesso: {tipo_solicitacao} ({categoria}) registrado no sistema. Localização: {gps}")