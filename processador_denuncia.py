# Armazenamento temporário
historico_denuncias = []

def registrar_denuncia(tipo_solicitacao):
    """
    Funçâo para receber 'Emergência' ou 'Ajuda'
    """
    # Adiciona o tipo a lista
    historico_denuncias.append(tipo_solicitacao)
    print(f"Sucesso: {tipo_solicitacao} registrado no sistema.")