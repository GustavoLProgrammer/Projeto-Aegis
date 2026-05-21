import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Button
import android.view.View.GONE
import android.view.View.VISIBLE
import androidx.fragment.app.Fragment

class ReportFragment : Fragment(R.layout.fragment_report) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Elementos da Tela
        val tvTitulo = view.findViewById<TextView>(R.id.tvTitulo)
        val btnEmergencia = view.findViewById<Button>(R.id.btnEmergencia)
        val btnAjuda = view.findViewById<Button>(R.id.btnAjuda)
        
        // Botões do Quiz
        val btnPerseguicao = view.findViewById<Button>(R.id.btnPerseguicao)
        val btnAgressaoDomestica = view.findViewById<Button>(R.id.btnAgressaoDomestica)
        val btnAgressao = view.findViewById<Button>(R.id.btnAgressao)

        // GPS simulado capturado automaticamente pelo Wear OS
        val gpsSimulado = "-23.5505, -46.6333"

        // Botão Emergência: Envio imediato
        btnEmergencia.setOnClickListener {
            tvTitulo.text = "POLÍCIA ACIONADA!\nGPS: $gpsSimulado"
            btnEmergencia.visibility = GONE
            btnAjuda.visibility = GONE
            
            println("Alerta: Botão de Emergência acionado de forma direta!")
            // Aqui integrará com o seu Python: registrar_denuncia("Emergência", "Botão de Pânico", gpsSimulado)
        }
        
        // Botão Ajuda: Transiciona a tela para as 3 opções do Quiz
        btnAjuda.setOnClickListener {
            tvTitulo.text = "Selecione a Ocorrência:"
            
            // Oculta os botões iniciais
            btnEmergencia.visibility = GONE
            btnAjuda.visibility = GONE
            
            // Exibe as 3 opções solicitadas
            btnPerseguicao.visibility = VISIBLE
            btnAgressaoDomestica.visibility = VISIBLE
            btnAgressao.visibility = VISIBLE
            
            println("Quiz de monitoramento iniciado com opções de botões.")
        }

        // Configuração das ações dos botões do Quiz
        val encerrarComSucesso = { categoria: String ->
            tvTitulo.text = "VIATURA ACIONADA!\nTipo: $categoria\nGPS: $gpsSimulado"
            btnPerseguicao.visibility = GONE
            btnAgressaoDomestica.visibility = GONE
            btnAgressao.visibility = GONE
        }

        btnPerseguicao.setOnClickListener {
            encerrarComSucesso("Perseguição")
            println("Alerta enviado: Ajuda -> Perseguição | GPS: $gpsSimulado")
            // Conexão com Python: registrar_denuncia("Ajuda", "Perseguição", gpsSimulado)
        }

        btnAgressaoDomestica.setOnClickListener {
            encerrarComSucesso("Agressão Doméstica")
            println("Alerta enviado: Ajuda -> Agressão Doméstica | GPS: $gpsSimulado")
            // Conexão com Python: registrar_denuncia("Ajuda", "Agressão Doméstica", gpsSimulado)
        }

        btnAgressao.setOnClickListener {
            encerrarComSucesso("Agressão")
            println("Alerta enviado: Ajuda -> Agressão | GPS: $gpsSimulado")
            // Conexão com Python: registrar_denuncia("Ajuda", "Agressão", gpsSimulado)
        }
    }
}